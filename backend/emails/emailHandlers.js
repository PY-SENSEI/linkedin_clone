import { mailtrapClient, sender } from "../lib/mailtrap.js"
import { createWelcomeEmailTemplate } from "./emailTemplates.js"

export const sendWelcomeEmail = async (email, name, profileUrl) => {
    const recipient = [{ email }];
    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Welcome to Unlinked",
            html: createWelcomeEmailTemplate(name, profileUrl),
            category: "Welcome",
        });

        // Log the entire response to see its structure
        console.log("Email sent successfully", response);

    } catch (error) {
        console.error("Error sending email:", error);
    }
};

export const sendCommentNotificationEmail = async (
    recipientEmail,
    recipientName,
    commentername,
    postUrl,
    content,
    commentContent
) => {
    const recipient = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "New comment on your post",
            html: createCommentNotificationEmailTemplate(
                recipientName,
                commentername,
                postUrl,
                content,
                commentContent),
                category: "Comment Notification",
        })
        console.log("Comment Notification Email sent successfully", response)
    } catch (error) {
        throw error
    }
}

export const sendConnectionAcceptedEmail = async (senderEmail, senderName, recipientName, profileUrl) => {
    const recipient = [{ email }];
    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: `${recipientName} accepted your connection request`,
            html: createWelcomeEmailTemplate(senderName, recipientName, profileUrl),
            category: "Connection Accepted",
 })
    }catch(error){

    }
}