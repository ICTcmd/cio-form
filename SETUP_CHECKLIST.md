# ✅ Supabase Setup Checklist

Follow these steps in order:

## Step 1: Run SQL Script ⚙️

1. Go to Supabase Dashboard
2. Open your project: **cio-request-system**
3. Click **SQL Editor** (left sidebar)
4. Click **+ New Query**
5. Open file: `supabase-setup.sql`
6. Copy ALL the SQL code
7. Paste into Supabase SQL Editor
8. Click **RUN** button
9. ✅ Should see: "Success"

## Step 2: Get Your Keys 🔑

1. Click **Settings** (gear icon)
2. Click **API**
3. Find and COPY:

```
Project URL:
[                                    ] 📋 Copy

anon public key:  
[                                    ] 📋 Copy
```

## Step 3: Update Code 💻

1. Open: `index.html`
2. Find line ~443:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
3. Replace with YOUR values:
   ```javascript
   const SUPABASE_URL = 'https://xxx.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGc...';
   ```
4. Save file

## Step 4: Deploy 🚀

```bash
git add index.html
git commit -m "Add Supabase credentials"
git push
```

Wait 30 seconds for Vercel deployment

## Step 5: Test! 🧪

### Test 1: Submit Request
1. Go to: https://cio-form.vercel.app
2. Fill out form
3. Click "Submit Request"
4. ✅ Should see: "Request submitted successfully!"
5. Note the Control Number

### Test 2: Check Database
1. Go to Supabase
2. Click **Table Editor**
3. Click **requests** table
4. ✅ Should see your request!

### Test 3: Admin Dashboard
1. Go to: https://cio-form.vercel.app/#admin
2. Login with: `CIOBago2026`
3. ✅ Should see your request in table!

### Test 4: Real-time Updates ⚡
1. Open admin in Window 1
2. Open form in Window 2
3. Submit request in Window 2
4. ✅ Watch it appear in Window 1 INSTANTLY!

### Test 5: Admin Actions
- [ ] Click 📞 to call
- [ ] Click 💬 for messenger
- [ ] Change status dropdown
- [ ] Click 🖨️ to reprint
- [ ] Click 📥 to export CSV

## 🎉 All Done!

Your system is now:
- ✅ Connected to Supabase
- ✅ Storing data in real database
- ✅ Real-time updates working
- ✅ Multi-device access enabled
- ✅ Production ready!

---

## 📞 Quick Reference

**Public Form:** https://cio-form.vercel.app  
**Admin:** https://cio-form.vercel.app/#admin  
**Password:** CIOBago2026  
**Supabase:** https://supabase.com/dashboard/project/xfrnzqjnblxxxxx

---

## ⚠️ Important Notes

1. **Keep your anon key safe** but it's okay if public (RLS protects data)
2. **NEVER share your service_role key** (that's secret!)
3. **Change admin password** in code
4. **Backup regularly** - Export CSV monthly

---

## 🆘 Need Help?

**Error: "Supabase is not defined"**
→ The CDN script didn't load. Check internet connection.

**Error: "Invalid API key"**
→ Double-check you copied the anon key correctly.

**Requests not showing in admin?**
→ Open browser console (F12) and check for errors.

**Real-time not working?**
→ Make sure you're logged into admin (not just viewing form).

---

**Status:** Ready for Production ✅  
**Version:** 2.0  
**Updated:** September 2026
