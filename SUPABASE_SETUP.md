# 🚀 Supabase Integration Setup Guide

## Step-by-Step Setup

### 1. Create Database Table

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Open your project: **cio-request-system**
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the entire content from `supabase-setup.sql`
6. Click **Run** or press `Ctrl+Enter`
7. You should see: "Success. No rows returned"

### 2. Get Your Credentials

1. In Supabase dashboard, click **Settings** (gear icon) → **API**
2. Copy these two values:

   **Project URL:**
   ```
   https://xfrnzqjnblxxxxx.supabase.co
   ```

   **anon/public key:**
   ```
   eyJhbGci...very-long-key...
   ```

### 3. Update Your Code

Open `index.html` and find these lines (around line 443):

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Replace with your URL
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your anon key
```

Replace with your actual values:

```javascript
const SUPABASE_URL = 'https://xfrnzqjnblxxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGci...your-actual-key...';
```

### 4. Test the Connection

1. Save the file
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Integrate Supabase database"
   git push
   ```
3. Wait 30 seconds for Vercel deployment
4. Go to your form and submit a test request
5. Check Supabase **Table Editor** → **requests** table to see the data

### 5. Verify Real-time Updates

1. Open admin dashboard in two browser windows
2. Submit a request in one window
3. Watch it appear instantly in the other window! ⚡

## What You Get with Supabase

### ✅ Features Now Working:

1. **Persistent Storage**
   - All requests saved to PostgreSQL database
   - Data survives browser closures
   - Access from any device

2. **Real-time Updates**
   - New requests appear instantly for all admins
   - No need to refresh the page
   - Multiple admins can work simultaneously

3. **Better Performance**
   - Fast database queries
   - Automatic indexing
   - Scalable to thousands of requests

4. **Data Security**
   - Row Level Security (RLS) enabled
   - Public can only submit (INSERT)
   - Only admins can view/update (SELECT/UPDATE)
   - No one can permanently delete (optional)

5. **Backup & Export**
   - Automatic Supabase backups
   - Manual CSV export still available
   - Point-in-time recovery (paid plans)

### 📊 Database Structure

**`requests` table:**
- `id` - Unique identifier
- `control_number` - Request control number
- `created_at` - When submitted
- `updated_at` - Last modified
- All form fields (requesting_office, contact_person, etc.)
- `status` - Current status
- Plus all other form data

### 🔒 Security Features

**Row Level Security Policies:**

1. **Public (Unauthenticated)**
   - Can INSERT new requests ✅
   - Can SELECT (view) all requests ✅
   - Cannot UPDATE ❌
   - Cannot DELETE ❌

2. **Authenticated Admins**
   - Can SELECT all ✅
   - Can UPDATE all ✅
   - Can DELETE (if needed) ✅

### 🎯 Next Steps (Optional)

#### A. Set Up Email Notifications

Use Supabase Database Webhooks:
1. Go to **Database** → **Webhooks**
2. Create webhook for INSERT on `requests` table
3. Send to EmailJS or your email service

#### B. Set Up Supabase Auth

Replace password authentication with proper auth:
1. Enable Email auth in Supabase
2. Create admin accounts
3. Update login function to use `supabase.auth.signInWithPassword()`

#### C. Add More Features

- Search and filter requests
- Advanced analytics dashboard
- PDF generation on the server
- SMS notifications via Twilio
- File uploads for event photos

## 🐛 Troubleshooting

### Problem: "Supabase is not defined"
**Solution:** Make sure the Supabase CDN script is loaded:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### Problem: "Invalid API key"
**Solution:** 
- Double-check you copied the **anon/public** key (not the service_role key)
- Make sure there are no extra spaces or quotes
- The key should start with `eyJ`

### Problem: "Row Level Security Policy Violation"
**Solution:**
- Run the SQL setup script again
- Make sure RLS policies are created
- Check that the policies allow INSERT for anon users

### Problem: Requests not appearing in admin
**Solution:**
- Check browser console for errors (F12)
- Verify the table name is exactly `requests` (lowercase)
- Make sure you ran the complete SQL setup

### Problem: Real-time not working
**Solution:**
- Real-time is enabled by default on new Supabase projects
- Check **Settings** → **API** → **Realtime** is ON
- Make sure you're logged into admin dashboard

## 📱 Testing Checklist

- [ ] SQL script runs without errors
- [ ] Can submit a request from public form
- [ ] Request appears in Supabase Table Editor
- [ ] Can login to admin dashboard
- [ ] Requests display in admin table
- [ ] Can update status
- [ ] Can call contact (mobile)
- [ ] Can message on Messenger
- [ ] Can reprint form
- [ ] Can export to CSV
- [ ] Real-time updates work (open admin in 2 windows)

## 🎉 You're Done!

Your CIO Request System is now powered by Supabase! 

**Benefits:**
- ✅ Production-ready database
- ✅ Real-time collaboration
- ✅ Secure and scalable
- ✅ Free tier (up to 500MB database, 2GB bandwidth)
- ✅ Automatic backups
- ✅ Access from anywhere

---

**Need Help?**
- Supabase Docs: https://supabase.com/docs
- Support: Check browser console (F12) for errors
- Community: https://github.com/supabase/supabase/discussions

**Version:** 2.0 with Supabase  
**Last Updated:** September 2026
