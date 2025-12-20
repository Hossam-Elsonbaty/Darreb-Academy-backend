import Stripe from "stripe";
import Course from "../models/Course.js";
import User from "../models/User.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const handlePayment = async(req,res)=>{
  const {products} = req.body;
  const userId = req.user._id.toString();
  console.log(userId);
  
  const lineItems = products.map((item) => {
    const course = item.course;
    return {
      price_data: {
        currency: "egp",
        product_data: {
          name: course.title,
          images: [course.thumbnail],
        },
        unit_amount: course.price * 100, 
      },
      quantity: 1,
    };
  });
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/404",
      client_reference_id: userId, 
      metadata: {
        courseIds: products.map((item) => item.course._id).join(","),
      },
    });
    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error.message);
    res.status(500).json({ message: "Error creating checkout session" });
  }
}

const stripeWebhook = async (req, res) => {
  console.log('Webhook event received');
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    // Verify the webhook signature to ensure it's coming from Stripe
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  // Handle the 'checkout.session.completed' event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log('Checkout session completed', session); 
    try {
      // Get the user based on the session's client_reference_id
      const userId = session.client_reference_id; // This should be the user ID passed earlier
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get the course IDs from the session metadata
      const courseIds = session.metadata.courseIds.split(","); // Assuming it's a comma-separated string
      const courses = await Course.find({ "_id": { $in: courseIds } });
      console.log('Courses fetched:', courses);
      if (!courses.length) {
        return res.status(404).json({ message: "Courses not found" });
      }

      // Update the user's purchasedCourses array
      user.purchasedCourses.push(...courses);
      await user.save();
      console.log("Updated user:", user); 
    } catch (error) {
      console.error("Error processing payment or updating user's courses:", error);
      return res.status(500).send("Error processing webhook event");
    }
  }

  // Respond with 200 to acknowledge receipt of the event
  res.status(200).send("Webhook received");
};

export {handlePayment,stripeWebhook}