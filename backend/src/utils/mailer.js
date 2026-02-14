import nodemailer from "nodemailer" 

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendOtpEmail = async (email, otp) => {
 await transporter.sendMail({
  to: email,
  subject: "Your One-Time Verification Code",
  html: `
  <div style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:40px 0;">
      <tr>
        <td align="center">
          <table width="420" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;padding:30px;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            
            <tr>
              <td align="center" style="font-size:22px;font-weight:bold;color:#333333;padding-bottom:10px;">
                Verification Code
              </td>
            </tr>

            <tr>
              <td align="center" style="font-size:14px;color:#666666;padding-bottom:25px;">
                Use the following One-Time Password (OTP) to continue:
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:15px 0;">
                <div style="display:inline-block;font-size:28px;font-weight:bold;letter-spacing:4px;color:#2d3748;background:#edf2f7;padding:12px 24px;border-radius:8px;">
                  ${otp}
                </div>
              </td>
            </tr>

            <tr>
              <td align="center" style="font-size:13px;color:#888888;padding-top:15px;">
                This code will expire in <b>2 minutes</b>.
              </td>
            </tr>

            <tr>
              <td align="center" style="font-size:13px;color:#888888;padding-top:5px;">
                If you didn’t request this, you can safely ignore this email.
              </td>
            </tr>

            <tr>
              <td align="center" style="padding-top:25px;font-size:12px;color:#aaaaaa;">
                Do not share this code with anyone.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
  `,
  text: `Your OTP code is ${otp}. It expires in 2 minutes. Do not share this code.`
});

};
