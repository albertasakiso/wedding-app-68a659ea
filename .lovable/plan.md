

## Premium Wedding App - May 2, 2026

### Design Theme: Elegant Gold & Ivory
- **Primary**: Rich gold (#D4AF37) with subtle gradients
- **Background**: Warm ivory/cream (#FFFFF0, #FDF5E6)
- **Accents**: Soft champagne, blush hints
- **Typography**: Elegant serif headings (Playfair Display), clean sans-serif body
- **Elements**: Subtle floral ornaments, soft shadows, smooth animations

### Features to Build

**1. Landing Page / Hero**
- Full-screen hero with couple's names and wedding date countdown
- Animated countdown timer to May 2, 2026
- Elegant navigation to all sections
- Smooth scroll between sections

**2. RSVP System**
- Open access form (no login required)
- Guest name, email, attendance status
- Plus-one option, meal preference selection
- Dietary restrictions field
- Success confirmation with animation

**3. Event Schedule & Timeline**
- Vertical timeline component
- Ceremony, cocktail hour, reception, after-party
- Time, location, and description for each event
- Visual icons for each event type

**4. Venue & Directions**
- Venue details with photo placeholder
- Embedded map or link to Google Maps
- Parking information
- Nearby hotels/accommodation suggestions

**5. Photo Gallery**
- Masonry-style gallery layout
- Lightbox for full-screen viewing
- Placeholder for engagement photos
- Option for guest uploads (later phase)

### Database Schema

```text
rsvps
├── id (uuid, primary key)
├── guest_name (text, required)
├── email (text)
├── attending (boolean)
├── plus_one_name (text, nullable)
├── meal_preference (text)
├── dietary_restrictions (text)
├── message (text, nullable)
├── created_at (timestamp)

events
├── id (uuid, primary key)
├── title (text)
├── description (text)
├── event_time (timestamp)
├── location (text)
├── order_index (int)

venue_info
├── id (uuid, primary key)
├── name (text)
├── address (text)
├── map_url (text)
├── parking_info (text)
├── hotels (jsonb)

gallery_photos
├── id (uuid, primary key)
├── url (text)
├── caption (text)
├── uploaded_by (text)
├── created_at (timestamp)
```

### Page Structure
- **/** - Landing page with all sections as scroll targets
- **/rsvp** - Dedicated RSVP form page
- **/gallery** - Full photo gallery page

### Implementation Order
1. Set up design system (colors, typography, CSS variables)
2. Create database tables with RLS policies (public read/write for RSVPs)
3. Build landing page with hero and countdown
4. Implement RSVP form with Supabase integration
5. Add event timeline section
6. Add venue/directions section
7. Create photo gallery
8. Polish animations and responsiveness

