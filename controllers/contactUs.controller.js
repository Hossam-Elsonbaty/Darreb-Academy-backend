import ContactUs from "../models/ContactUs.js";
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const getContactEmails = async (req, res) => {
  try {
    const contacts = await ContactUs.find();
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error fetching data from database:', error);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
}
const addContactEmail = async (req, res) => {
  const data = req.body;
  const subject = 'Inquiry Received'
  const msg = 'Hi!\nThanks for reaching out to Darreb Academy! A member of our team will get in touch with you soon regarding your inquiry and message.'
  const footer = `Best Wishes,\nDarreb Academy Team`
  if (!data.name || !data.email || !data.message) {
    return res.status(400).json({ message: 'Please fill in all fields.' });
  }
  const newContactUs = new ContactUs(data);
  try {
    await newContactUs.save();
    await sendThankYouEmail(data.email, msg, footer,subject)
    const msg2 = {
      to: 'info@alarqamacademy.org', // Receiver's email
      from: 'info@alarqamacademy.org', // Use a verified sender
      subject: 'Contact Us',
      text: `Name: ${data.name}\nEmail: ${data.email}\nMessage: ${data.message}`,
      html: `
              <h1>Contact Us</h1>
              <p>Name: ${data.name}</p>
              <p>Email: ${data.email}</p>
              <p>Message: ${data.message}</p>
            `
    };
    await sgMail.send(msg2)
    .then((res)=>{console.log(res);})
    .catch((err)=>{console.log(err.message);})
    res.status(201).json({ success: true, data: newContactUs });
  } catch (error) {
    console.error('Error saving contact or sending email:', error);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
}
export {
  getContactEmails,
  addContactEmail
}