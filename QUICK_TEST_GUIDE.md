# Quick Test Guide — New Features

## Before Testing
1. **Apply Database Migration:**
   ```sql
   -- Run this in Supabase SQL Editor:
   ALTER TABLE public.requests
   ADD COLUMN IF NOT EXISTS dispatch_data JSONB;
   ```

2. **Refresh Browser:** Clear cache (Ctrl+Shift+R or Cmd+Shift+R)

---

## Test #1: Remarks Field Mandatory ✅

### User Form Test:
1. Go to: `https://cio-bago.digital/`
2. Scroll to "Submit a Service Request" form
3. Fill in all required fields EXCEPT remarks
4. Try to submit
5. **Expected:** Red border on remarks field + error message: "Please provide remarks or additional instructions for your request."
6. Fill in remarks
7. Submit should work

---

## Test #2: Dispatch Number Generation ✅

### Admin Dashboard Test:
1. Go to: `https://cio-bago.digital/admin-dashboard`
2. Log in
3. Click dispatch icon (📤) on any request
4. Look at "Dispatch No." field
5. **Expected:** Field is read-only (grayed out) with "Generate" button next to it
6. Click "Generate" button
7. **Expected:** Field fills with format `CIO-20260917-XXX` (today's date + random 3 digits)
8. Click Generate again — should get a different number

---

## Test #3: Layout Artist Field ✅

### Dispatch Form Test:
1. In dispatch modal (from Test #2)
2. Scroll to "Coverage Team" section
3. **Expected:** See these fields in order:
   - Photographer(s)
   - Videographer(s)
   - Writer / Documentation
   - Drone Operator
   - Reels Videographer
   - **Layout Artist** ← NEW FIELD
4. Type a name in Layout Artist field: "Juan Dela Cruz"
5. Scroll down and click "Print"
6. **Expected:** Print preview shows Layout Artist with the name you entered

---

## Test #4: Save Dispatch Form ✅

### Save & Load Test:
1. In dispatch modal, fill in several fields:
   - Click "Generate" for dispatch number
   - Fill: df_photographers = "Test Photographer"
   - Fill: df_layoutArtist = "Test Artist"
   - Fill: df_transport = "Service Vehicle"
   - Fill: df_instructions = "Test instructions"

2. Click **"Save"** button (green button with floppy disk icon)
3. **Expected:** Toast message: "✅ Dispatch form saved successfully!"

4. Close the dispatch modal

5. Reopen the same request's dispatch form
6. **Expected:** All fields you filled are still there!
   - Dispatch number
   - Photographers
   - Layout Artist
   - Transport
   - Instructions

7. Change something (e.g., add to instructions)
8. Click "Save" again
9. Close and reopen — changes should persist

---

## Test #5: Calendar View ✅

### Calendar Tab Test:
1. In admin dashboard, click **"📅 Calendar"** tab
2. **Expected:** See:
   - Current month name and year (e.g., "September 2026")
   - 7-column calendar grid (Sun-Sat)
   - Today's date has blue border
   - Events appear as blue pills on their dates

3. Click **"Next →"** button
4. **Expected:** Calendar shows next month

5. Click **"← Prev"** button twice
6. **Expected:** Calendar shows previous month

7. Click **"Today"** button
8. **Expected:** Returns to current month

---

## Test #6: Calendar Events ✅

### Event Display Test:
1. Make sure you have at least one request with an event_date in the current month
   - If not, create a test request via the user form

2. Go to Calendar tab
3. **Expected:** 
   - Event appears as blue pill on the correct date
   - Hover shows full event name + office
   - Click event → opens full request details modal

4. Scroll down below calendar
5. **Expected:** "Upcoming Events This Month" section shows:
   - All events in current month, sorted by date
   - Event name, office, date, and status badge
   - Click any event → opens details

---

## Test #7: Multiple Events on Same Day

### Dense Calendar Test:
1. Create 4-5 test requests with same event_date
2. Go to Calendar tab
3. **Expected:**
   - First 3 events show as blue pills
   - "+2 more" indicator appears
   - All events listed in "Upcoming Events" section below

---

## Test #8: Print with All Fields

### Complete Print Test:
1. Open dispatch modal
2. Click "Generate" for dispatch number
3. Fill in ALL fields:
   - Event details
   - All team members (including Layout Artist)
   - Transportation, meals, instructions
   - Dispatched by and date

4. Click "Save"
5. Click "Print"
6. **Expected:** Print preview shows:
   - Dispatch number at top
   - All event details
   - Complete team list including Layout Artist
   - Transportation and meals
   - Special instructions
   - Signature section with "Dispatched By"

---

## Common Issues & Fixes

### Issue: "dispatch_data column not found"
**Fix:** Run the SQL migration in Supabase dashboard

### Issue: Calendar not showing events
**Fix:** 
- Check if requests have valid event_date in YYYY-MM-DD format
- Refresh the page
- Check browser console for errors

### Issue: Save button not working
**Fix:**
- Check if you're logged in as admin
- Verify dispatch modal opened from a valid request
- Check browser console for errors

### Issue: Dispatch number "Generate" button not appearing
**Fix:** 
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache

---

## Success Criteria

All tests pass when:
- ✅ Remarks field prevents submission when empty
- ✅ Dispatch number generates automatically in correct format
- ✅ Layout Artist field appears and saves
- ✅ Save button persists all dispatch data
- ✅ Saved data loads when reopening dispatch form
- ✅ Calendar displays current month with events
- ✅ Calendar navigation works (prev/next/today)
- ✅ Events are clickable and open details
- ✅ Print includes all fields including Layout Artist

---

## Quick Fix Commands

### Clear Browser Cache (All Browsers):
- **Windows:** Ctrl + Shift + Delete
- **Mac:** Cmd + Shift + Delete

### Hard Refresh:
- **Windows:** Ctrl + Shift + R
- **Mac:** Cmd + Shift + R

### Check Browser Console:
- **All Browsers:** F12 → Console tab
- Look for red error messages

---

**Happy Testing! 🎉**
