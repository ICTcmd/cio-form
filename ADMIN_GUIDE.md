# CIO Request Form System - Admin Guide

## 🎯 Overview

Complete request management system for the City Information Office with:
- Public request submission form
- Admin dashboard for request management
- Real-time notifications
- Contact management features

## 🔐 Admin Access

### Default Password
- **Password**: `CIOBago2026`
- **Change it in the code**: Look for `const ADMIN_PASSWORD` in index.html

### How to Access Admin Dashboard
1. Go to your form URL
2. Add `#admin` to the end: `https://cio-form.vercel.app/#admin`
3. Enter the admin password
4. Click "Login"

## 📋 Features

### 1. Public Form Features
- ✅ Required contact fields (Name, Phone/Viber, FB Messenger)
- ✅ Mandatory acknowledgment checkbox
- ✅ Auto-generated control numbers (format: CIO-YYYYMMDD-XXXX)
- ✅ Instant submission with confirmation
- ✅ Optional print for user records

### 2. Admin Dashboard Features

#### Request Management Table
Each request displays:
- Control Number (unique identifier)
- Date submitted
- Requesting Office
- Contact Person
- Phone/Viber Number
- FB Messenger Name
- Event Name & Date
- Services requested
- Current Status

#### Quick Contact Actions
- **📞 Call Button**: Direct phone call via `tel:` link
- **💬 Messenger Button**: Opens Facebook Messenger or copies profile name
- **🖨️ Reprint Button**: Generate the official 2-up printable form
- **🗑️ Delete Button**: Remove request (with confirmation)

#### Status Management
Update request status with dropdown:
- **Pending** (default on submission)
- **Contacted** (initial contact made)
- **Approved** (request approved)
- **Declined** (request declined)
- **Completed** (service completed)

#### Dashboard Tools
- **🔄 Refresh**: Reload requests from storage
- **📥 Export CSV**: Download all requests as CSV file
- **Logout**: Return to public form

## 🔔 Notifications Setup

### Option 1: EmailJS (Email Notifications)

1. **Sign up for EmailJS** (free):
   - Go to https://www.emailjs.com/
   - Create a free account
   - Add an email service (Gmail, Outlook, etc.)
   - Create an email template

2. **Get your credentials**:
   - Service ID
   - Template ID
   - Public Key

3. **Update the code** (in index.html):
   ```javascript
   const EMAILJS_SERVICE_ID = 'your_service_id';
   const EMAILJS_TEMPLATE_ID = 'your_template_id';
   const EMAILJS_PUBLIC_KEY = 'your_public_key';
   ```

4. **Add EmailJS script** (add before closing `</body>` tag):
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
   <script>emailjs.init('YOUR_PUBLIC_KEY');</script>
   ```

5. **Uncomment the EmailJS code** in `sendNotification()` function

### Option 2: Webhook (Telegram/Discord)

#### For Telegram:
1. Create a Telegram bot with @BotFather
2. Get your bot token
3. Get your chat ID
4. Use webhook URL: `https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<CHAT_ID>&text=`

#### For Discord:
1. Go to Server Settings → Integrations → Webhooks
2. Create a webhook
3. Copy the webhook URL
4. Update `webhookURL` in the code

## 💾 Data Storage

- **LocalStorage**: All requests stored in browser's localStorage
- **Persistence**: Data persists across sessions
- **Export**: CSV export available for backup
- **Important**: Data is stored locally per browser/device

### Backup Your Data
Regularly export requests to CSV:
1. Go to admin dashboard
2. Click "📥 Export to CSV"
3. Save the file as backup

## 📱 Mobile Responsiveness

- Public form: Fully mobile-responsive
- Admin dashboard: Best viewed on tablet/desktop
- Contact buttons work on mobile devices

## 🎨 Customization

### Change Admin Password
```javascript
const ADMIN_PASSWORD = 'YourNewPassword';
```

### Change Control Number Format
```javascript
// In generateControlNumber() function
return `CIO-${year}${month}${day}-${random}`;
// Change to your preferred format
```

### Change Color Scheme
Look for these color codes in CSS:
- Primary: `#667eea` (purple-blue)
- Success: `#28a745` (green)
- Danger: `#dc3545` (red)

## 🔒 Security Notes

1. **Change the default password** immediately
2. **Don't share the admin URL** publicly
3. **Regularly backup your data** (export CSV)
4. **Consider server-side storage** for production use
5. **Use HTTPS** (Vercel provides this automatically)

## 📞 Support

For technical support or customization requests, contact the ICT team.

## 🚀 Deployment

Already deployed on Vercel: https://cio-form.vercel.app

### Update Deployment
Any changes pushed to GitHub will automatically deploy to Vercel.

```bash
git add .
git commit -m "Your changes"
git push
```

## 📊 Usage Statistics

To track usage, consider adding:
- Google Analytics
- Vercel Analytics (built-in)
- Custom event tracking

---

**Version**: 1.0  
**Last Updated**: September 2026  
**Developed for**: City Information Office, City Government of Bago
