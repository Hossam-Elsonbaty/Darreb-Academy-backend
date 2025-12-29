import Stripe from "stripe";
import Course from "../models/Course.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
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
      success_url: "https://darreb-academy.vercel.app/success",
      cancel_url: "https://darreb-academy.vercel.app/404",
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
      const userId = session.client_reference_id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const courseIds = session.metadata.courseIds.split(",");
      const courses = await Course.find({ "_id": { $in: courseIds } });
      console.log('Courses fetched:', courses);
      
      if (!courses.length) {
        return res.status(404).json({ message: "Courses not found" });
      }
      const newCourses = courses.filter(course => 
        !user.purchasedCourses.some(purchased => 
          purchased.toString() === course._id.toString()
        )
      );
      if (newCourses.length > 0) {
        user.purchasedCourses.push(...newCourses.map(c => c._id));
        await user.save();
        console.log("Updated user with new courses:", user);
      } else {
        console.log("All courses already purchased");
        return res.status(400).json({ message: "You have already purchased these courses" });
      }
      const order = await Order.create({
        orderId: session.id,
        user: userId,
        items: courses.map(course => ({
          course: course._id,
          title: course.title,
          price: course.price,
        })),
        total: courses.reduce((acc, course) => acc + course.price, 0),
        paymentMethod: "Stripe",
        paymentStatus: "completed",
      });
    } catch (error) {
      console.error("Error processing payment or updating user's courses:", error);
      return res.status(500).send("Error processing webhook event");
    }
  }
  res.status(200).send("Webhook received");
};

export {handlePayment,stripeWebhook}