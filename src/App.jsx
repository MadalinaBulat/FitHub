import { useState, useEffect, useRef, useCallback } from "react";

// ─── SYNCED STATE (mirrors interactions between presenter & audience) ─────────
const SYNC_CHANNEL_NAME = "fithub-state-sync";
let _syncChannel = null;
function getSyncChannel() {
  if (!_syncChannel) _syncChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  return _syncChannel;
}

function useSyncedState(key, initial) {
  const [val, setVal] = useState(initial);
  useEffect(() => {
    const ch = getSyncChannel();
    const handler = e => {
      if (e.data?.key === key) setVal(e.data.value);
    };
    ch.addEventListener("message", handler);
    return () => ch.removeEventListener("message", handler);
  }, [key]);

  const setSynced = useCallback(v => {
    setVal(prev => {
      const next = typeof v === "function" ? v(prev) : v;
      getSyncChannel().postMessage({ key, value: next });
      return next;
    });
  }, [key]);

  return [val, setSynced];
}

// Broadcast an action event (for things like login animation)
function broadcastAction(action) {
  getSyncChannel().postMessage({ action });
}
function useActionListener(action, handler) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  useEffect(() => {
    const ch = getSyncChannel();
    const h = e => { if (e.data?.action === action) handlerRef.current(); };
    ch.addEventListener("message", h);
    return () => ch.removeEventListener("message", h);
  }, [action]);
}

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=Barlow+Condensed:wght@700;800;900&family=JetBrains+Mono:wght@400;500&display=swap";
document.head.appendChild(fontLink);

// ─── EXACT PALETTE FROM SCREENSHOTS ──────────────────────────────────────────
const A = {
  bg:        "#0d1514",   // darkest bg
  sidebar:   "#111c1b",   // sidebar bg
  card:      "#151f1e",   // card bg
  cardBorder:"#1d2e2c",   // card border
  surface:   "#1a2827",   // slightly lighter surface
  teal:      "#00c9be",   // the bright cyan/teal CTA
  tealDim:   "#008f87",   // dimmer teal for borders/accents
  tealBg:    "#0d2221",   // teal-tinted bg
  text:      "#ffffff",   // primary text
  sub:       "#f0fffd",   // secondary text
  dim:       "#d0eeeb",   // tertiary text
  border:    "#1d2e2c",   // border colour
  white:     "#ffffff",
  red:       "#e05555",
  pink:      "#e06b8a",
  purple:    "#9b8de8",
  amber:     "#e8a020",
  green:     "#2ec4a0",
  blue:      "#4e9de8",
  orange:    "#e8722a",
};

// Type accent colours matching the coloured left-border on class cards
const TYPE_COL = {
  "HIIT/LIIT":   A.red,
  "Meditation":  A.purple,
  "Total Body":  A.amber,
  "Pilates":     A.blue,
  "Zumba":       A.pink,
  "Yoga":        A.green,
  "Full Body":   A.purple,
  "HIIT":        A.red,
  "Strength":    A.orange,
};

// ─── DATA ─────────────────────────────────────────────────────────────────────
const MEMBER_NAME = "Madalina Bulat";
const MEMBER_INITIALS = "MB";
const MEMBER_EMAIL = "jmfhpca@jmfamily.com";

const SCHEDULE = {
  MONDAY: [
    { id:1, time:"12:00 PM", type:"HIIT/LIIT", instructor:"Alissa", duration:"55m", left:19, total:20, booked:true },
  ],
  TUESDAY: [
    { id:2, time:"7:30 AM",  type:"Meditation", instructor:"Heather", duration:"30m", left:14, total:15, booked:true },
    { id:3, time:"12:00 PM", type:"Total Body",  instructor:"Paige",   duration:"55m", left:20, total:20, booked:false },
    { id:4, time:"5:30 PM",  type:"Pilates",     instructor:"Juan",    duration:"60m", left:15, total:15, booked:false },
  ],
  WEDNESDAY: [
    { id:5, time:"12:00 PM", type:"Zumba",  instructor:"Juan",    duration:"55m", left:24, total:25, booked:true },
    { id:6, time:"5:30 PM",  type:"Yoga",   instructor:"Heather", duration:"60m", left:18, total:18, booked:false },
  ],
  THURSDAY: [
    { id:7, time:"12:00 PM", type:"HIIT/LIIT", instructor:"Alissa", duration:"55m", left:20, total:20, booked:false },
    { id:8, time:"5:30 PM",  type:"Full Body",  instructor:"Paige",  duration:"60m", left:19, total:20, booked:true },
  ],
};

const BOOKINGS = [
  { title:"HIIT/LIIT",  status:"CONFIRMED", detail:"Mon, Mar 16 · 12:00 PM · Alissa · 55m" },
  { title:"Meditation", status:"CONFIRMED", detail:"Tue, Mar 17 · 7:30 AM · Heather · 30m" },
  { title:"Zumba",      status:"CONFIRMED", detail:"Wed, Mar 18 · 12:00 PM · Juan · 55m" },
  { title:"Full Body",  status:"CONFIRMED", detail:"Thu, Mar 19 · 5:30 PM · Paige · 60m" },
];

const BOOKING_HISTORY = [
  { title:"HIIT/LIIT",  status:"ATTENDED",  detail:"Tue, Mar 10 \u00b7 12:00 PM \u00b7 Alissa \u00b7 55m" },
  { title:"Zumba",      status:"ATTENDED",  detail:"Wed, Mar 4 \u00b7 12:00 PM \u00b7 Juan \u00b7 55m" },
  { title:"Meditation", status:"ATTENDED",  detail:"Tue, Mar 3 \u00b7 7:30 AM \u00b7 Heather \u00b7 30m" },
  { title:"Full Body",  status:"CANCELLED", detail:"Thu, Feb 27 \u00b7 5:30 PM \u00b7 Paige \u00b7 60m" },
  { title:"HIIT/LIIT",  status:"ATTENDED",  detail:"Mon, Feb 24 \u00b7 12:00 PM \u00b7 Alissa \u00b7 55m" },
];

const ROSTER = [
  { name:"Madalina Bulat", email:"jmfhpca@jmfamily.com", init:"MB", status:"Confirmed" },
  { name:"Seth Behar",     email:"sbehar@jmfamily.com",   init:"SB", status:"Confirmed" },
  { name:"Sam Rivera",     email:"srivera@jmfamily.com",  init:"SR", status:"Confirmed" },
  { name:"Matt Goodman",   email:"mgoodman@jmfamily.com", init:"MG", status:"Confirmed" },
  { name:"Mike Damiano",   email:"mdamiano@jmfamily.com", init:"MD", status:"Confirmed" },
  { name:"Isaac Adrian",   email:"iadrian@jmfamily.com",  init:"IA", status:"Confirmed" },
  { name:"Jordan Yu",      email:"jyu@jmfamily.com",      init:"JY", status:"Confirmed" },
];

// ─── SLIDES ───────────────────────────────────────────────────────────────────
const SLIDES = [
  {
    id: "welcome",
    label: "Welcome",
    notes: `Good morning, everyone, and thank you for being here. My name is Madalina Bulat, and over these past few months I have been working very closely with the Power Platform team  under Rickie Ramchaitar. One thing I noticed doing so, was that they build software to make the lives of JM associates better, and that is the direction I wanted to take for this capstone.`
  },

  {
    id: "screenshot",
    label: "Overview",
    notes: `On the screen, you can see the current fitness page. Although it shows the times classes are offered, there is no real way to book them or track progress. That is how JM FitHub came to be.`
  },

  {
    id: "title",
    label: "Sign In",
    notes: `This is the first thing associates see when they open FitHub — a clean login page.

Users can register with their JM Family email and a password, or sign in if they already have an account.

Let me go ahead and sign in so we can take a look at the actual application.`
  },

  {
    id: "schedule",
    label: "Weekly Schedule",
    notes: `This is really the heart of the app.

Right now, we have eight classes running Monday through Thursday. These include HIIT/LIIT, Meditation, Total Body, Pilates, Zumba, Yoga, and Full Body — a good mix across seven categories.

Each card shows the instructor, start time, duration, and how many spots are left out of the maximum capacity.

If a class looks interesting, the associate can simply click the card to book it. If the class is already full, the system automatically places them on a waitlist.

The goal here was to make booking as simple and intuitive as possible.`
  },

  {
    id: "bookings",
    label: "My Bookings",
    notes: `Once someone books a class, it shows up here under My Bookings.

If something comes up, the user can cancel directly from this screen as long as it is at least one hour before the class begins.

After attending a class, users can also submit a star rating for the class they took.`
  },

  {
    id: "progress",
    label: "Progress",
    notes: `This is one of my favorite parts of the application — the progress dashboard.

Here we track a user’s activity, including their current workout streak, total classes attended, total hours completed, and total points earned.

Below that is a badge system with eleven different achievements like First Rep, On Fire, Iron Will, Early Bird, and Fitness Royalty. Some badges are common, while others are rare or even epic.`
  },

  {
    id: "locations",
    label: "Locations",
    notes: `Next, we have the locations view.

Right now, we support six gym locations, including Deerfield Beach headquarters, two Jacksonville sites, Margate, Mobile, and St. Louis.

Each location displays its operating hours — some are open 24 hours, while others follow standard business hours.

We also highlight peak associate-only hours for the Jacksonville gyms.

The Deerfield Beach headquarters location is where our instructor-led classes are primarily hosted.`
  },

  {
    id: "profile",
    label: "Profile",
    notes: `This is the member profile page.

Users can update information such as their first name, last name, department, job title, biography, and time zone.

The system also displays their role within the platform, which can be Associate, Instructor, or Admin.

Roles control which features and views the user has access to throughout the application.

All of this data is stored securely in Azure SQL, with ASP.NET Identity handling account management, password hashing, and lockout policies.`
  },

  {
    id: "email",
    label: "Confirmation Email",
    notes: `The moment someone books a class, they automatically receive a confirmation email.

These emails are sent through SendGrid and include all relevant class details such as the date, time, instructor, location, and duration.

Each message also contains an ICS calendar file attachment so the class can be added directly to Outlook or Google Calendar.

If the user cancels their booking, they receive a cancellation email with an updated ICS file that removes the event.

The entire process is automated, and if an email fails to send, we place it into a retry queue where it gets retried every five minutes.`
  },

  {
    id: "instructor",
    label: "Instructor Portal",
    notes: `Now let’s switch over to the instructor side of the platform.

When someone logs in with the Instructor role, they gain access to additional functionality.

Instructors can create, edit, publish, and cancel classes through the My Classes section.

They also have access to a roster view showing every associate who has booked an upcoming class, along with their email and booking date.`
  },

  {
    id: "system",
    label: "System Architecture",
    notes: `At a high level, the architecture follows a modern full-stack pattern.

The React front end communicates with an ASP.NET Core Web API. That API handles business logic and interacts with Azure SQL for data storage.

Images like trainer avatars and class banners are stored in Azure Blob Storage.

SendGrid is used for transactional emails, while SignalR provides real-time updates. For example, when someone books or cancels a class, seat availability updates instantly for everyone viewing that class.

The entire system is hosted on Azure App Service.`
  },

  {
    id: "erd",
    label: "ERD Diagram",
    notes: `As we can see in the ERD, ApplicationUser is the center of everything. It extends ASP.NET Identity and stores each associate’s information.

TrainerProfile connects one-to-one with ApplicationUser for instructors and holds their bios.

TrainingClass belongs to a TrainerProfile — that is a one-to-many relationship — and stores everything about a class, including the title, category, level, schedule, and capacity.

Booking is the key junction table. It connects an ApplicationUser to a TrainingClass and tracks the status through its full lifecycle: Confirmed, Waitlisted, Attended, Cancelled, plus feedback ratings and calendar sync information.

AssociateProgress is another one-to-one relationship off of ApplicationUser. It tracks each member’s streaks, points, badges earned, and monthly activity for the gamification features.

Notification links back to ApplicationUser to power the in-app alert system for booking confirmations, reminders, and waitlist promotions. And finally, FailedEmails is a standalone table  — it acts as a retry queue for any SendGrid emails that fail to send, storing the recipient, subject, HTML body, retry count, and error message so the background worker can automatically retry them.`
  },

  {
    id: "azure",
    label: "Azure Infrastructure",
    notes: `On the infrastructure side, everything is deployed in Azure.

The API runs on Azure App Service, while the relational database runs on Azure SQL.

Entity Framework uses a built-in retry policy for transient database errors — three retries with a ten-second delay.

For file storage, we use Azure Blob Storage with separate containers for trainer avatars, class banners, certifications, and class materials.`
  },

  {
    id: "sendgrid",
    label: "Email & Calendar",
    notes: `For email and calendar integration, we use SendGrid.

Booking confirmations include ICS calendar attachments, while cancellation emails include calendar cancellation events.

Class reminders are automatically sent the day before the class begins.

If an email fails, the message is inserted into the FailedEmails table, where the background worker retries sending it automatically.`
  },

  {
    id: "cicd",
    label: "GitHub CI/CD",
    notes: `Finally, deployment is handled through GitHub Actions.

Whenever code is pushed to the main branch, a pipeline automatically builds the application, runs tests, and deploys the latest version to Azure App Service.

Pull requests also trigger linting and automated checks to keep the main branch stable and production-ready.`
  },

  {
    id: "roadmap",
    label: "What's Next",
    notes: `Looking ahead, there are several features on the roadmap.

We plan to expand social features so associates can see who else is attending the same classes and form workout groups.

We also want to enhance the leaderboard with department-level competition and seasonal challenges.

Learning Paths are already implemented in the backend and will soon be exposed in the UI to guide users through structured fitness programs.

Additional goals include push notifications and a more advanced administrative dashboard.`
  },

  {
    id: "thankyou",
    label: "Thank You",
    notes: `And that’s JM FitHub.

To recap: the system uses React and Vite on the front end, ASP.NET Core on the backend, Azure SQL for data, Azure Blob Storage for files, SendGrid for email, SignalR for real-time updates, and GitHub Actions for CI/CD.

Thank you for listening, and I’d be happy to take any questions.`
  }
];

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

// JM Family logo — uses tree.png
function Logo({ size = 32 }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}tree.png`}
      alt="JM FitHub"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.18,
        objectFit: "cover",
        flexShrink: 0
      }}
    />
  );
}
// Sidebar shared by all member demo screens
function Sidebar({ active, onNav }) {
  const links = ["Schedule","My Bookings","Progress","Locations","Profile"];
  return (
    <div style={{ width:210, background:A.sidebar, borderRight:`1px solid ${A.border}`,
      display:"flex", flexDirection:"column", flexShrink:0, height:"100%" }}>
      {/* Brand */}
      <div style={{ padding:"16px 16px 12px", display:"flex", alignItems:"center", gap:10,
        borderBottom:`1px solid ${A.border}` }}>
        <Logo size={32} />
        <div>
          <div style={{ fontFamily:"Barlow", fontSize:15, fontWeight:700, color:A.text,
            lineHeight:1.1 }}>JM FitHub</div>
          <div style={{ fontFamily:"Barlow", fontSize:11, color:A.sub }}>DEERFIELD BEACH</div>
        </div>
      </div>
      {/* Hours badge */}
      <div style={{ margin:"10px 12px", background:A.surface, borderRadius:8,
        padding:"8px 12px", border:`1px solid ${A.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:A.red }}/>
         
        </div>
        <div style={{ fontFamily:"Barlow", fontSize:11, color:A.sub }}>Open 24/7</div>
      </div>
      {/* Role badge */}
      <div style={{ padding:"10px 16px 6px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:A.teal }}/>
          <span style={{ fontFamily:"Barlow", fontSize:11, fontWeight:700,
            color:A.teal, letterSpacing:"0.08em" }}>MEMBER</span>
        </div>
      </div>
      {/* Nav links */}
      <nav style={{ flex:1, padding:"4px 0" }}>
        {links.map(l => (
          <div key={l} onClick={() => onNav && onNav(l)}
            style={{ padding:"9px 18px", fontFamily:"Barlow", fontSize:14, fontWeight:500,
              color: active===l ? A.teal : A.sub,
              background: active===l ? `${A.teal}12` : "transparent",
              borderLeft: active===l ? `3px solid ${A.teal}` : "3px solid transparent",
              cursor:"pointer", transition:"all 0.12s" }}>
            {l}
          </div>
        ))}
      </nav>
      {/* User footer */}
      <div style={{ padding:"12px 14px", borderTop:`1px solid ${A.border}`,
        display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:32, height:32, borderRadius:"50%", background:A.tealDim,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:"Barlow", fontSize:12, fontWeight:700, color:A.text, flexShrink:0 }}>
          {MEMBER_INITIALS}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:"Barlow", fontSize:13, fontWeight:600,
            color:A.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {MEMBER_NAME}
          </div>
          <div style={{ fontFamily:"Barlow", fontSize:11, color:A.sub }}>Member</div>
        </div>
        <div style={{ fontSize:14, color:A.dim, cursor:"pointer" }}>⏻</div>
      </div>
    </div>
  );
}

function TealBtn({ children, onClick, style = {}, small, outline }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background: outline ? "transparent" : h ? "#00e8dc" : A.teal,
        color: outline ? (h ? A.teal : A.sub) : A.bg,
        border: outline ? `1px solid ${A.border}` : "none",
        borderRadius:6, cursor:"pointer", fontFamily:"Barlow", fontWeight:700,
        fontSize: small ? 12 : 14, padding: small ? "5px 12px" : "8px 20px",
        letterSpacing:"0.03em", transition:"all 0.12s", ...style }}>
      {children}
    </button>
  );
}

function RedBtn({ children, onClick, small }) {
  return (
    <button onClick={onClick}
      style={{ background:"transparent", border:`1px solid ${A.red}55`,
        color:A.red, borderRadius:6, cursor:"pointer", fontFamily:"Barlow", fontWeight:600,
        fontSize: small ? 12 : 13, padding: small ? "5px 10px" : "7px 14px" }}>
      {children}
    </button>
  );
}

function ClassCard({ cls, onBook, onCancel }) {
  const col = TYPE_COL[cls.type] || A.teal;
  const pct = ((cls.total - cls.left) / cls.total) * 100;
  return (
    <div style={{ background:A.card, border:`1px solid ${A.cardBorder}`, borderRadius:10,
      borderLeft:`3px solid ${col}`, padding:"14px 16px", marginBottom:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ fontFamily:"Barlow", fontSize:22, fontWeight:800, color:A.text,
          letterSpacing:"-0.02em" }}>{cls.time}</div>
        {cls.booked && (
          <span style={{ background:`${A.teal}22`, color:A.teal, border:`1px solid ${A.teal}44`,
            borderRadius:4, padding:"2px 8px", fontFamily:"Barlow", fontSize:11,
            fontWeight:700, letterSpacing:"0.05em" }}>BOOKED</span>
        )}
      </div>
      <div style={{ fontFamily:"Barlow", fontSize:15, fontWeight:700, color:col, marginBottom:2 }}>
        {cls.type}
      </div>
      <div style={{ fontFamily:"Barlow", fontSize:13, color:A.sub, marginBottom:10 }}>
        {cls.instructor} · {cls.duration}
      </div>
      {/* Capacity bar */}
      <div style={{ height:2, background:A.border, borderRadius:99, marginBottom:6 }}>
        <div style={{ width:`${pct}%`, height:"100%", background:col, borderRadius:99 }}/>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10,
        fontFamily:"Barlow", fontSize:12, color:A.sub }}>
        <span>{cls.left} left</span>
        <span>{cls.total - cls.left}/{cls.total}</span>
      </div>
      {cls.booked ? (
        <div style={{ display:"flex", gap:8 }}>
          <div style={{ flex:1, background:A.surface, border:`1px solid ${A.tealDim}`,
            borderRadius:6, padding:"7px 0", textAlign:"center",
            fontFamily:"Barlow", fontSize:13, fontWeight:700, color:A.teal }}>
            ✓ CONFIRMED
          </div>
          <RedBtn small onClick={onCancel}>Cancel</RedBtn>
        </div>
      ) : (
        <TealBtn onClick={onBook} style={{ width:"100%", padding:"9px 0", fontSize:13,
          letterSpacing:"0.08em" }}>BOOK</TealBtn>
      )}
    </div>
  );
}

// ─── SLIDE: WELCOME ───────────────────────────────────────────────────────────
const TECH_BADGES = [
  "React 18",
  "ASP.NET Core 9",
  "Entity Framework 9",
  "SendGrid",
  "Azure Services",
  "App Insights",
  "GitHub Actions",
];

function SlideWelcome({ onNext }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background: `
          radial-gradient(circle at top left, ${A.teal}12 0%, transparent 28%),
          radial-gradient(circle at bottom right, ${A.teal}10 0%, transparent 30%),
          linear-gradient(180deg, ${A.bg} 0%, #0a1111 100%)
        `,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 56px",
      }}
    >
      {/* Soft grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${A.teal}0d 1px, transparent 1px),
            linear-gradient(90deg, ${A.teal}0d 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
          pointerEvents: "none",
        }}
      />

      {/* Decorative rings */}
      <svg
        style={{
          position: "absolute",
          width: "70%",
          height: "70%",
          right: "-10%",
          top: "8%",
          pointerEvents: "none",
          opacity: 0.4,
        }}
        viewBox="0 0 700 500"
        fill="none"
      >
        <ellipse
          cx="390"
          cy="250"
          rx="240"
          ry="205"
          stroke={A.teal}
          strokeWidth="1.4"
          opacity="0.28"
        />
        <ellipse
          cx="300"
          cy="250"
          rx="190"
          ry="165"
          stroke={A.teal}
          strokeWidth="1.2"
          opacity="0.18"
        />
        <ellipse
          cx="445"
          cy="235"
          rx="120"
          ry="105"
          stroke={A.teal}
          strokeWidth="1"
          opacity="0.14"
        />
      </svg>

      {/* Main centered content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 1180,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            marginBottom: 24,
            padding: "8px 18px",
            border: `1px solid ${A.teal}40`,
            borderRadius: 999,
            background: `${A.teal}10`,
            color: A.sub,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 1.8,
            textTransform: "uppercase",
            fontFamily: "Barlow, sans-serif",
            backdropFilter: "blur(6px)",
          }}
        >
          JM Family Enterprises · Capstone Presentation
        </div>

        {/* Main title */}
        <div style={{ marginBottom: 26 }}>
          <h1
            style={{
              margin: 0,
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 900,
              fontSize: 108,
              lineHeight: 0.94,
              letterSpacing: "-2px",
              textTransform: "uppercase",
              color: "#ffffff",
              textShadow: "0 10px 35px rgba(0,0,0,0.28)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                background: "#ffffff",
                color: A.bg,
                padding: "2px 18px 6px",
                borderRadius: 8,
                boxShadow: "0 10px 30px rgba(0,0,0,0.14)",
              }}
            >
              Move Better.
            </span>
            <br />
            <span
              style={{
                display: "inline-block",
                marginTop: 10,
                background: `linear-gradient(135deg, ${A.teal} 0%, #7ee6e6 100%)`,
                color: A.bg,
                padding: "2px 18px 6px",
                borderRadius: 8,
                boxShadow: "0 12px 34px rgba(0,0,0,0.18)",
              }}
            >
              Together.
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p
          style={{
            margin: 0,
            maxWidth: 760,
            color: A.sub,
            fontSize: 21,
            lineHeight: 1.55,
            fontWeight: 400,
            fontFamily: "Barlow, sans-serif",
          }}
        >
          Internal fitness booking platform for class scheduling, instructor
          management, notifications, progress tracking, and enterprise-ready
          wellness engagement.
        </p>

        {/* Presenter name */}
        <div
          style={{
            marginTop: 22,
            color: "#ffffff",
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: 0.5,
            fontFamily: "Barlow, sans-serif",
          }}
        >
          Madalina Bulat
        </div>

        {/* Divider */}
        <div
          style={{
            width: 120,
            height: 2,
            marginTop: 28,
            marginBottom: 30,
            background: `linear-gradient(90deg, transparent 0%, ${A.teal} 50%, transparent 100%)`,
            borderRadius: 999,
          }}
        />

        {/* Tech stack badges */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 12,
            maxWidth: 900,
          }}
        >
          {TECH_BADGES.map((t) => (
            <span
              key={t}
              style={{
                padding: "9px 16px",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                fontFamily: "JetBrains Mono, monospace",
                color: "#dffefe",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${A.teal}35`,
                borderRadius: 999,
                boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
                backdropFilter: "blur(8px)",
                whiteSpace: "nowrap",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SLIDE: SCREENSHOT ────────────────────────────────────────────────────────
function SlideScreenshot({ onNext }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: A.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <img
        src={`${import.meta.env.BASE_URL}screenshot.jpeg`}
        alt="SharePoint Health & Wellness"
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain"
        }}
      />
    </div>
  );
}

// ─── SLIDE: TITLE ─────────────────────────────────────────────────────────────
function SlideTitle({ onNext }) {
  const [loading, setLoading] = useSyncedState("title-loading", false);
  const [done, setDone]       = useSyncedState("title-done", false);

  function login() {
    setLoading(true);
    broadcastAction("title-login");
    setTimeout(() => { setLoading(false); setDone(true); }, 1200);
    setTimeout(() => onNext(), 2200);
  }

  // Audience replays the animation when presenter clicks Sign In
  useActionListener("title-login", () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 1200);
    setTimeout(() => onNext(), 2200);
  });

  return (
    <div style={{ width:"100%", height:"100%", display:"flex", overflow:"hidden", position:"relative" }}>
      {/* Left — hero */}
      <div style={{ flex:"0 0 58%", position:"relative", overflow:"hidden" }}>
        {/* Gym photo background */}
        <div style={{ position:"absolute", inset:0,
          backgroundImage:`url('${import.meta.env.BASE_URL}FitHub/gym-hero.jpg')`, backgroundSize:"cover", backgroundPosition:"center" }}/>
        {/* Dark overlay for text readability */}
        <div style={{ position:"absolute", inset:0,
          background:"linear-gradient(135deg, rgba(13,21,20,0.38) 0%, rgba(10,26,24,0.25) 50%, rgba(13,21,20,0.40) 100%)" }}/>
        {/* Large hero text */}
        <div style={{ position:"absolute", bottom:60, left:40, right:40 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
            <div style={{ width:3, height:18, background:A.teal }}/>
            <span style={{ fontFamily:"Barlow", fontSize:12, fontWeight:600, color:A.teal,
              letterSpacing:"0.15em" }}>JM FAMILY ENTERPRISES · WELLNESS</span>
          </div>
          <div style={{ fontFamily:"Barlow Condensed", fontSize:88, fontWeight:900,
            color:A.white, lineHeight:0.92, marginBottom:16, letterSpacing:"-0.01em" }}>
            <div>MOVE</div>
            <div style={{ color:A.teal }}>BETTER</div>
            <div>TOGETHER</div>
          </div>
          <p style={{ fontFamily:"Barlow", fontSize:15, color:"#ffffff",
            maxWidth:360, margin:"0 0 32px", lineHeight:1.5 }}>
            Book fitness classes, track progress, and build healthy habits with your JM Family colleagues – at no cost.
          </p>
          <div style={{ display:"flex", gap:40 }}>
            {[["8","WEEKLY CLASSES"],["4","INSTRUCTORS"],["Free","TO ASSOCIATES"]].map(([n,l]) => (
              <div key={l}>
                <div style={{ fontFamily:"Barlow Condensed", fontSize:36, fontWeight:900,
                  color: l==="TO ASSOCIATES" ? A.teal : A.white }}>{n}</div>
                <div style={{ fontFamily:"Barlow", fontSize:10, fontWeight:600, color:A.sub,
                  letterSpacing:"0.12em" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Top nav bar */}
        <div style={{ position:"absolute", top:0, left:0, right:0, padding:"14px 20px",
          display:"flex", alignItems:"center", gap:10 }}>
          <Logo size={28} />
          <span style={{ fontFamily:"Barlow", fontSize:14, fontWeight:700, color:A.text }}>JM FitHub</span>
          <span style={{ fontFamily:"Barlow", fontSize:13, color:A.dim }}>· DEERFIELD BEACH</span>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:A.green }}/>
            <span style={{ fontFamily:"Barlow", fontSize:12, color:A.sub }}>Open 24/7</span>
          </div>
        </div>
      </div>

      {/* Right — sign in panel */}
      <div style={{ flex:1, background:A.bg, display:"flex", alignItems:"center",
        justifyContent:"center", padding:"48px 40px" }}>
        <div style={{ width:"100%", maxWidth:380 }}>
          <h2 style={{ fontFamily:"Barlow", fontSize:28, fontWeight:800, color:A.text,
            margin:"0 0 4px" }}>Sign in</h2>
          <p style={{ fontFamily:"Barlow", fontSize:14, color:A.sub, margin:"0 0 28px" }}>
            Access your FitHub portal
          </p>

          {/* Role toggle */}
          <div style={{ fontFamily:"Barlow", fontSize:11, fontWeight:600,
            color:A.sub, letterSpacing:"0.1em", marginBottom:8 }}>I AM A</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0,
            border:`1px solid ${A.border}`, borderRadius:8, overflow:"hidden", marginBottom:20 }}>
            <div style={{ padding:"9px 0", textAlign:"center", background:A.teal,
              fontFamily:"Barlow", fontSize:14, fontWeight:700, color:A.bg, cursor:"pointer" }}>
              Member
            </div>
            <div style={{ padding:"9px 0", textAlign:"center", background:"transparent",
              fontFamily:"Barlow", fontSize:14, fontWeight:500, color:A.sub, cursor:"pointer",
              borderLeft:`1px solid ${A.border}` }}>
              Instructor
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom:14 }}>
            <div style={{ fontFamily:"Barlow", fontSize:11, fontWeight:600, color:A.sub,
              letterSpacing:"0.1em", marginBottom:6 }}>EMAIL</div>
            <input defaultValue="jmhpca@jmfamily.com"
              style={{ width:"100%", background:A.surface, border:`1px solid ${A.border}`,
                borderRadius:8, padding:"10px 14px", color:A.text,
                fontFamily:"Barlow", fontSize:14, outline:"none", boxSizing:"border-box" }}/>
          </div>

          {/* Password */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontFamily:"Barlow", fontSize:11, fontWeight:600, color:A.sub,
              letterSpacing:"0.1em", marginBottom:6 }}>PASSWORD</div>
            <input type="password" defaultValue="Lina2003!"
              style={{ width:"100%", background:A.surface, border:`1px solid ${A.border}`,
                borderRadius:8, padding:"10px 14px", color:A.text,
                fontFamily:"Barlow", fontSize:14, outline:"none", boxSizing:"border-box" }}/>
          </div>

          <TealBtn onClick={login} style={{ width:"100%", padding:"12px 0", fontSize:15,
            letterSpacing:"0.04em" }} disabled={loading||done}>
            {done ? "✓ Signed in!" : loading ? "Signing in..." : "Sign In"}
          </TealBtn>
          <div style={{ textAlign:"center", marginTop:16, fontFamily:"Barlow", fontSize:13, color:A.sub }}>
            No account?{" "}
            <span style={{ color:A.teal, cursor:"pointer", fontWeight:600 }}>Create one</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DEMO: LOGIN ──────────────────────────────────────────────────────────────
function DemoLogin({ onNext }) {
  const [loading, setLoading] = useSyncedState("demologin-loading", false);
  const [done, setDone]       = useSyncedState("demologin-done", false);

  function login() {
    setLoading(true);
    broadcastAction("demologin-login");
    setTimeout(() => { setLoading(false); setDone(true); }, 1200);
    setTimeout(() => onNext(), 2200);
  }

  useActionListener("demologin-login", () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 1200);
    setTimeout(() => onNext(), 2200);
  });

  return (
    <div style={{ width:"100%", height:"100%", display:"flex", overflow:"hidden" }}>
      {/* Left hero */}
      <div style={{ flex:"0 0 58%", position:"relative", overflow:"hidden",
        background:`linear-gradient(135deg, #1a3530 0%, #0a1a18 40%, #0d1514 100%)` }}>
        <div style={{ position:"absolute", bottom:60, left:40, right:40 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
            <div style={{ width:3, height:18, background:A.teal }}/>
            <span style={{ fontFamily:"Barlow", fontSize:12, fontWeight:600, color:A.teal,
              letterSpacing:"0.15em" }}>JM FAMILY ENTERPRISES · WELLNESS</span>
          </div>
          <div style={{ fontFamily:"Barlow Condensed", fontSize:80, fontWeight:900,
            color:A.text, lineHeight:0.92, marginBottom:16 }}>
            <div>MOVE</div>
            <div style={{ color:A.teal }}>BETTER</div>
            <div>TOGETHER</div>
          </div>
          <p style={{ fontFamily:"Barlow", fontSize:14, color:"#f0fffd",
            maxWidth:340, margin:"0 0 28px", lineHeight:1.5 }}>
            Book fitness classes, track progress, and build healthy habits — at no cost.
          </p>
          <div style={{ display:"flex", gap:36 }}>
            {[["8","WEEKLY CLASSES"],["4","INSTRUCTORS"],["Free","TO ASSOCIATES"]].map(([n,l]) => (
              <div key={l}>
                <div style={{ fontFamily:"Barlow Condensed", fontSize:32, fontWeight:900,
                  color: l==="TO ASSOCIATES" ? A.teal : A.white }}>{n}</div>
                <div style={{ fontFamily:"Barlow", fontSize:9, fontWeight:600, color:A.sub,
                  letterSpacing:"0.12em" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position:"absolute", top:0, left:0, right:0, padding:"14px 20px",
          display:"flex", alignItems:"center", gap:10 }}>
          <Logo size={26} />
          <span style={{ fontFamily:"Barlow", fontSize:14, fontWeight:700, color:A.text }}>JM FitHub</span>
          <span style={{ fontFamily:"Barlow", fontSize:12, color:A.dim }}>· DEERFIELD BEACH</span>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:A.green }}/>
            <span style={{ fontFamily:"Barlow", fontSize:12, color:A.sub }}>Open 24/7</span>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex:1, background:A.bg, display:"flex", alignItems:"center",
        justifyContent:"center", padding:"48px 40px" }}>
        <div style={{ width:"100%", maxWidth:380 }}>
          <h2 style={{ fontFamily:"Barlow", fontSize:26, fontWeight:800, color:A.text, margin:"0 0 4px" }}>
            Sign in
          </h2>
          <p style={{ fontFamily:"Barlow", fontSize:14, color:A.sub, margin:"0 0 24px" }}>
            Access your FitHub portal
          </p>
          <div style={{ fontFamily:"Barlow", fontSize:11, fontWeight:600, color:A.sub,
            letterSpacing:"0.1em", marginBottom:7 }}>I AM A</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
            border:`1px solid ${A.border}`, borderRadius:8, overflow:"hidden", marginBottom:18 }}>
            <div style={{ padding:"9px 0", textAlign:"center", background:A.teal,
              fontFamily:"Barlow", fontSize:13, fontWeight:700, color:A.bg }}>Member</div>
            <div style={{ padding:"9px 0", textAlign:"center",
              fontFamily:"Barlow", fontSize:13, color:A.sub,
              borderLeft:`1px solid ${A.border}` }}>Instructor</div>
          </div>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontFamily:"Barlow", fontSize:10, fontWeight:600, color:A.sub,
              letterSpacing:"0.1em", marginBottom:5 }}>EMAIL</div>
            <input defaultValue={MEMBER_EMAIL}
              style={{ width:"100%", background:A.surface, border:`1px solid ${A.border}`,
                borderRadius:8, padding:"9px 13px", color:A.text,
                fontFamily:"Barlow", fontSize:13, outline:"none", boxSizing:"border-box" }}/>
          </div>
          <div style={{ marginBottom:18 }}>
            <div style={{ fontFamily:"Barlow", fontSize:10, fontWeight:600, color:A.sub,
              letterSpacing:"0.1em", marginBottom:5 }}>PASSWORD</div>
            <input type="password" defaultValue="Lina2003!"
              style={{ width:"100%", background:A.surface, border:`1px solid ${A.border}`,
                borderRadius:8, padding:"9px 13px", color:A.text,
                fontFamily:"Barlow", fontSize:13, outline:"none", boxSizing:"border-box" }}/>
          </div>
          <TealBtn onClick={login} style={{ width:"100%", padding:"11px 0", fontSize:14 }}
            disabled={loading||done}>
            {done ? "✓ Signed in!" : loading ? "Signing in..." : "Sign In"}
          </TealBtn>
          <div style={{ textAlign:"center", marginTop:14, fontFamily:"Barlow", fontSize:13, color:A.sub }}>
            No account? <span style={{ color:A.teal, cursor:"pointer" }}>Create one</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DEMO: SCHEDULE ───────────────────────────────────────────────────────────
function DemoSchedule({ onNext }) {
  const [filter, setFilter] = useSyncedState("schedule-filter", "ALL");
  const filters = ["ALL","HIIT/LIIT","MEDITATION","TOTAL BODY","PILATES","ZUMBA","YOGA","FULL BODY"];
  const days = Object.keys(SCHEDULE);

  return (
    <div style={{ display:"flex", height:"100%", overflow:"hidden" }}>
      <Sidebar active="Schedule" onNav={n => n==="My Bookings" && onNext()} />
      <div style={{ flex:1, padding:"28px 32px", overflow:"auto" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
          <h1 style={{ fontFamily:"Barlow", fontSize:28, fontWeight:800, color:A.text, margin:0 }}>
            Weekly Schedule
          </h1>
          <div style={{ background:A.surface, border:`1px solid ${A.tealDim}`, borderRadius:20,
            padding:"3px 12px", display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:A.teal }}/>
            <span style={{ fontFamily:"Barlow", fontSize:12, fontWeight:600, color:A.teal }}>
              DEERFIELD BEACH
            </span>
          </div>
        </div>
        <p style={{ fontFamily:"Barlow", fontSize:13, color:A.sub, margin:"0 0 20px" }}>
          Monday – Thursday · Book your spot · Limited capacity
        </p>

        {/* Filters */}
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:24 }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ background: filter===f ? A.teal : "transparent",
                border:`1px solid ${filter===f ? A.teal : A.border}`,
                borderRadius:6, padding:"5px 14px", color: filter===f ? "#fff" : A.sub,
                cursor:"pointer", fontFamily:"Barlow", fontSize:12, fontWeight:600 }}>
              {f}
            </button>
          ))}
        </div>

        {/* Day columns */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20 }}>
          {days.map(day => {
            const classes = SCHEDULE[day].filter(c =>
              filter === "ALL" || c.type.toUpperCase() === filter ||
              c.type.toUpperCase().includes(filter.replace("/",""))
            );
            return (
              <div key={day}>
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontFamily:"Barlow", fontSize:12, fontWeight:700, color:A.sub,
                    letterSpacing:"0.1em" }}>{day}</div>
                  <div style={{ fontFamily:"Barlow", fontSize:12, color:A.dim }}>
                    {classes.length} class{classes.length!==1?"es":""}
                  </div>
                </div>
                {classes.map(cls => (
                  <ClassCard key={cls.id} cls={cls} onBook={onNext} onCancel={() => {}} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── DEMO: BOOKINGS ───────────────────────────────────────────────────────────
function DemoBookings({ onNext }) {
  const [tab, setTab] = useSyncedState("bookings-tab", "upcoming");
  const [cancelled, setCancelled] = useSyncedState("bookings-cancelled", []);
  const [ratings, setRatings] = useSyncedState("bookings-ratings", {});
  const [hoverStar, setHoverStar] = useState({});
  const visibleBookings = BOOKINGS.filter((_, i) => !cancelled.includes(i));
  return (
    <div style={{ display:"flex", height:"100%", overflow:"hidden" }}>
      <Sidebar active="My Bookings" onNav={n => n==="Progress" && onNext()} />
      <div style={{ flex:1, padding:"28px 32px", overflow:"auto" }}>
        <h1 style={{ fontFamily:"Barlow", fontSize:28, fontWeight:800, color:A.text, margin:"0 0 4px" }}>
          My Bookings
        </h1>
        <p style={{ fontFamily:"Barlow", fontSize:13, color:A.sub, margin:"0 0 24px" }}>
          Upcoming sessions and class history
        </p>
        {/* Tabs */}
        <div style={{ display:"flex", borderBottom:`1px solid ${A.border}`, marginBottom:20 }}>
          {[["upcoming",`Upcoming (${visibleBookings.length})`],["history",`History (${BOOKING_HISTORY.length})`]].map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ background:"transparent", border:"none", padding:"8px 0",
                marginRight:24, cursor:"pointer", fontFamily:"Barlow", fontSize:14,
                fontWeight:600, color: tab===id ? A.teal : A.sub,
                borderBottom: tab===id ? `2px solid ${A.teal}` : "2px solid transparent",
                marginBottom:-1 }}>
              {label}
            </button>
          ))}
        </div>
        {/* Booking rows */}
        {tab === "upcoming" && (visibleBookings.length === 0
          ? <div style={{ textAlign:"center", padding:"40px 0", color:A.sub, fontFamily:"Barlow", fontSize:15 }}>No upcoming bookings</div>
          : BOOKINGS.map((b, i) => {
            if (cancelled.includes(i)) return null;
            return (
              <div key={i} style={{ background:A.card, border:`1px solid ${A.border}`,
                borderLeft:`3px solid ${TYPE_COL[b.title] || A.teal}`,
                borderRadius:10, padding:"16px 20px", marginBottom:10,
                display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                    <span style={{ fontFamily:"Barlow", fontSize:16, fontWeight:700, color:A.text }}>
                      {b.title}
                    </span>
                    <span style={{ background:`${A.teal}18`, color:A.teal,
                      border:`1px solid ${A.teal}44`, borderRadius:20, padding:"2px 8px",
                      fontFamily:"Barlow", fontSize:10, fontWeight:700, letterSpacing:"0.05em",
                      display:"flex", alignItems:"center", gap:4 }}>
                      <span style={{ width:5, height:5, borderRadius:"50%", background:A.teal, display:"inline-block" }}/>
                      {b.status}
                    </span>
                  </div>
                  <div style={{ fontFamily:"Barlow", fontSize:13, color:A.sub }}>{b.detail}</div>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button style={{ background:"transparent", border:`1px solid ${A.border}`,
                    borderRadius:6, padding:"6px 14px", color:A.sub, cursor:"pointer",
                    fontFamily:"Barlow", fontSize:13, display:"flex", alignItems:"center", gap:6 }}>
                    📅 Calendar
                  </button>
                  <RedBtn small onClick={() => setCancelled([...cancelled, i])}>Cancel</RedBtn>
                </div>
              </div>
            );
          })
        )}
        {tab === "history" && BOOKING_HISTORY.map((b, i) => (
          <div key={i} style={{ background:A.card, border:`1px solid ${A.border}`,
            borderLeft:`3px solid ${TYPE_COL[b.title] || A.teal}`,
            borderRadius:10, padding:"16px 20px", marginBottom:10,
            display:"flex", alignItems:"center", justifyContent:"space-between",
            opacity: b.status==="CANCELLED" ? 0.5 : 1 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                <span style={{ fontFamily:"Barlow", fontSize:16, fontWeight:700, color:A.text }}>
                  {b.title}
                </span>
                <span style={{ background: b.status==="ATTENDED" ? `${A.green}18` : `${A.red}18`,
                  color: b.status==="ATTENDED" ? A.green : A.red,
                  border:`1px solid ${b.status==="ATTENDED" ? A.green : A.red}44`,
                  borderRadius:20, padding:"2px 8px",
                  fontFamily:"Barlow", fontSize:10, fontWeight:700, letterSpacing:"0.05em",
                  display:"flex", alignItems:"center", gap:4 }}>
                  <span style={{ width:5, height:5, borderRadius:"50%",
                    background: b.status==="ATTENDED" ? A.green : A.red, display:"inline-block" }}/>
                  {b.status}
                </span>
              </div>
              <div style={{ fontFamily:"Barlow", fontSize:13, color:A.sub }}>{b.detail}</div>
            </div>
            {b.status === "ATTENDED" && (
              <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                {ratings[i] != null && <span style={{ fontFamily:"Barlow", fontSize:11, color:A.sub, marginRight:4 }}>Your rating:</span>}
                {[1,2,3,4,5].map(star => (
                  <span key={star}
                    onClick={() => setRatings({ ...ratings, [i]: star })}
                    onMouseEnter={() => setHoverStar({ ...hoverStar, [i]: star })}
                    onMouseLeave={() => setHoverStar({ ...hoverStar, [i]: 0 })}
                    style={{ cursor:"pointer", fontSize:20, transition:"transform 0.15s",
                      transform: (hoverStar[i] === star) ? "scale(1.3)" : "scale(1)",
                      color: star <= (hoverStar[i] || ratings[i] || 0) ? A.amber : A.dim }}>
                    ★
                  </span>
                ))}
                {ratings[i] != null && <span style={{ fontFamily:"Barlow", fontSize:12, fontWeight:700, color:A.amber, marginLeft:6 }}>{ratings[i]}/5</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DEMO: PROGRESS ───────────────────────────────────────────────────────────
function DemoProgress({ onNext }) {
  // Derive stats from BOOKING_HISTORY
  const attended = BOOKING_HISTORY.filter(b => b.status === "ATTENDED");
  const durMap = { "55m":55, "30m":30, "60m":60, "45m":45 };
  const parseDur = d => { const m = d.match(/(\d+)m$/); return m ? parseInt(m[1]) : 0; };

  // Classes this month (Mar)
  const marchClasses = attended.filter(b => b.detail.includes("Mar"));
  const marchHours = (marchClasses.reduce((s, b) => s + parseDur(b.detail), 0) / 60).toFixed(1) + "h";

  // Class type counts (for top type)
  const typeCounts = {};
  attended.forEach(b => { typeCounts[b.title] = (typeCounts[b.title] || 0) + 1; });
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  // Monthly breakdown for chart
  const months = [
    {m:"Sep",v:0},{m:"Oct",v:0},{m:"Nov",v:0},{m:"Dec",v:0},
    {m:"Jan",v:0},
    {m:"Feb",v: attended.filter(b => b.detail.includes("Feb")).length},
    {m:"Mar",v: marchClasses.length}
  ];
  const maxV = Math.max(...months.map(m => m.v), 1);

  // Class types this month for breakdown
  const marchTypes = {};
  marchClasses.forEach(b => { marchTypes[b.title] = (marchTypes[b.title] || 0) + 1; });
  const typeBreakdown = Object.entries(marchTypes).map(([t, n]) => [t, TYPE_COL[t] || A.teal, n]);
  const maxType = Math.max(...typeBreakdown.map(t => t[2]), 1);

  const badges = [
    { icon:"🎯", name:"First Step",      rarity:"COMMON",   earned: attended.length >= 1 },
    { icon:"⭐", name:"5 Classes",        rarity:"COMMON",   earned: attended.length >= 5 },
    { icon:"🔥", name:"On a Roll",        rarity:"UNCOMMON", earned: attended.length >= 8 },
    { icon:"💪", name:"Dedicated",        rarity:"RARE",     earned: attended.length >= 15 },
    { icon:"🏆", name:"Champion",         rarity:"EPIC",     earned: attended.length >= 30 },
    { icon:"🗺️", name:"Explorer",         rarity:"UNCOMMON", earned: Object.keys(typeCounts).length >= 4 },
  ];
  const earnedCount = badges.filter(b => b.earned).length;

  return (
    <div style={{ display:"flex", height:"100%", overflow:"hidden" }}>
      <Sidebar active="Progress" onNav={n => n==="Locations" && onNext()} />
      <div style={{ flex:1, padding:"20px 26px", overflow:"auto" }}>
        <h1 style={{ fontFamily:"Barlow", fontSize:26, fontWeight:800, color:A.text, margin:"0 0 2px" }}>Progress</h1>
        <p style={{ fontFamily:"Barlow", fontSize:12, color:A.sub, margin:"0 0 14px" }}>Your fitness journey at a glance</p>

        {/* Top stat cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:14 }}>
          {[
            {label:"CLASSES THIS MONTH", value: String(marchClasses.length), sub:"March attendance",  color:A.teal},
            {label:"HOURS WORKED OUT",   value: marchHours,                  sub:"Total this month",  color:A.purple},
            {label:"CURRENT STREAK",     value:"2",                          sub:"Consecutive weeks",  color:A.amber},
            {label:"TOP CLASS TYPE",     value: topType,                     sub:"Most attended overall", color:A.red},
          ].map(s=>(
            <div key={s.label} style={{ background:A.card, border:"1px solid "+A.border,
              borderTop:"2px solid "+s.color, borderRadius:10, padding:"13px 15px" }}>
              <div style={{ fontFamily:"Barlow", fontSize:9, fontWeight:700, color:A.sub,
                letterSpacing:"0.1em", marginBottom:6 }}>{s.label}</div>
              <div style={{ fontFamily:"Barlow Condensed", fontSize:32, fontWeight:900,
                color:s.color, lineHeight:1, marginBottom:4 }}>{s.value}</div>
              <div style={{ fontFamily:"Barlow", fontSize:10, color:A.dim }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Monthly bar chart + class breakdown side-by-side */}
        <div style={{ display:"grid", gridTemplateColumns:"5fr 2fr", gap:12, marginBottom:14 }}>
          <div style={{ background:A.card, border:"1px solid "+A.border, borderRadius:10, padding:"14px 18px" }}>
            <div style={{ marginBottom:10 }}>
              <div style={{ fontFamily:"Barlow", fontSize:13, fontWeight:700, color:A.text }}>Monthly Activity</div>
              <div style={{ fontFamily:"Barlow", fontSize:11, color:A.sub }}>Classes attended per calendar month</div>
            </div>
            {/* Bars */}
            <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:72 }}>
              {months.map((m,i) => (
                <div key={m.m} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:0 }}>
                  <div style={{ fontFamily:"Barlow", fontSize:9, color: m.v>0?A.teal:A.dim,
                    marginBottom:2, fontWeight:700 }}>{m.v}</div>
                  <div style={{ width:"100%", background: m.v>0 ? A.teal : A.tealDim,
                    borderRadius:"3px 3px 0 0", height: (m.v/maxV*100)+"%" ,
                    opacity: m.v>0 ? 1 : 0.4 }}/>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:8, marginTop:4 }}>
              {months.map((m) => (
                <div key={m.m} style={{ flex:1, textAlign:"center", fontFamily:"Barlow", fontSize:9,
                  color: m.v>0 ? A.teal : A.sub, fontWeight: m.v>0 ? 700 : 400 }}>{m.m}</div>
              ))}
            </div>
          </div>
          <div style={{ background:A.card, border:"1px solid "+A.border, borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontFamily:"Barlow", fontSize:13, fontWeight:700, color:A.text, marginBottom:2 }}>Class Types</div>
            <div style={{ fontFamily:"Barlow", fontSize:11, color:A.sub, marginBottom:12 }}>This month</div>
            {typeBreakdown.map(([t,c,n]) => (
              <div key={t} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                  <span style={{ fontFamily:"Barlow", fontSize:11, color:A.sub }}>{t}</span>
                  <span style={{ fontFamily:"Barlow", fontSize:11, color:c, fontWeight:700 }}>{n}</span>
                </div>
                <div style={{ height:4, background:A.border, borderRadius:99 }}>
                  <div style={{ width:(n/maxType*100)+"%", height:"100%", background:c, borderRadius:99 }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div style={{ background:A.card, border:"1px solid "+A.border, borderRadius:10, padding:"13px 16px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ fontFamily:"Barlow", fontSize:13, fontWeight:700, color:A.text }}>Fitness Badges</div>
            <div style={{ fontFamily:"Barlow", fontSize:11, color:A.teal }}>{earnedCount} / {badges.length} earned</div>
          </div>
          <div style={{ display:"flex", gap:9 }}>
            {badges.map(b => (
              <div key={b.name} style={{ flex:1, background:A.surface,
                border:"1px solid "+(b.earned ? A.tealDim : A.border),
                borderRadius:9, padding:"10px 6px", textAlign:"center", opacity: b.earned ? 1 : 0.45 }}>
                <div style={{ fontSize:18, marginBottom:5, filter: b.earned ? "none" : "grayscale(1)" }}>{b.icon}</div>
                <div style={{ fontFamily:"Barlow", fontSize:9, fontWeight:700, color: b.earned ? A.text : A.sub }}>{b.name}</div>
                <div style={{ fontFamily:"Barlow", fontSize:8, color: b.earned ? A.teal : A.dim,
                  letterSpacing:"0.06em", marginTop:2 }}>{b.rarity}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DEMO: LOCATIONS ──────────────────────────────────────────────────────────
function DemoLocations({ onNext }) {
  const locs = [
    { name:"Deerfield Beach", tags:["HQ","CLASSES"], hours:"Mon – Fri: 5:00 AM – 5:00 PM", peak:null },
    { name:"JAX – Baymeadows", tags:["JAX"], hours:"Open 24 / 7", peak:"Associates only: M-F 10 AM–1 PM · 4:30–6 PM" },
    { name:"JAX – Talleyrand/Westlake", tags:["JAX"], hours:"Open 24 / 7", peak:"Associates only: M-F 10 AM–1 PM · 3–6 PM" },
    { name:"Margate", tags:["MRG"], hours:"Mon-Sat 6 AM–11 PM · Sun 8 AM–7 PM", peak:null },
    { name:"Mobile", tags:["MOB"], hours:"Business hours", peak:null },
    { name:"St. Louis", tags:["STL"], hours:"Business hours", peak:null },
  ];
  return (
    <div style={{ display:"flex", height:"100%", overflow:"hidden" }}>
      <Sidebar active="Locations" onNav={n => n==="Profile" && onNext()} />
      <div style={{ flex:1, padding:"28px 32px", overflow:"auto" }}>
        <h1 style={{ fontFamily:"Barlow", fontSize:28, fontWeight:800, color:A.text, margin:"0 0 4px" }}>
          Fitness Centers
        </h1>
        <p style={{ fontFamily:"Barlow", fontSize:13, color:A.sub, margin:"0 0 24px" }}>
          Hours and access information across all JM Family locations
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
          {locs.map(loc => (
            <div key={loc.name} style={{ background:A.card, border:`1px solid ${A.border}`,
              borderRadius:10, padding:"18px 20px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <span style={{ fontFamily:"Barlow", fontSize:15, fontWeight:700, color:A.text }}>
                  {loc.name}
                </span>
                {loc.tags.map(t => (
                  <span key={t} style={{ background: t==="CLASSES" ? `${A.teal}22` : A.surface,
                    color: t==="CLASSES" ? A.teal : A.sub,
                    border:`1px solid ${t==="CLASSES" ? A.tealDim : A.border}`,
                    borderRadius:4, padding:"2px 8px", fontFamily:"Barlow", fontSize:10, fontWeight:700 }}>
                    {t}
                  </span>
                ))}
              </div>
              <div style={{ fontFamily:"Barlow", fontSize:14, fontWeight:600, color:A.text, marginBottom:6 }}>
                {loc.hours}
              </div>
              {loc.peak && (
                <div style={{ background:`${A.amber}12`, border:`1px solid ${A.amber}33`,
                  borderRadius:6, padding:"8px 12px" }}>
                  <div style={{ fontFamily:"Barlow", fontSize:10, fontWeight:700,
                    color:A.amber, letterSpacing:"0.1em", marginBottom:2 }}>PEAK · ASSOCIATES ONLY</div>
                  <div style={{ fontFamily:"Barlow", fontSize:12, color:A.sub }}>{loc.peak}</div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ background:A.surface, border:`1px solid ${A.border}`, borderRadius:10,
          padding:"12px 16px", fontFamily:"Barlow", fontSize:13, color:A.sub }}>
          <strong style={{ color:A.text }}>Associate Use Policy –</strong>{" "}
          During peak hours, fitness centers are reserved for associate use only. Contact your local HR or Facilities team with questions.
        </div>
      </div>
    </div>
  );
}

// ─── DEMO: PROFILE ────────────────────────────────────────────────────────────
function DemoProfile({ onNext }) {
  const [goal, setGoal] = useSyncedState("profile-goal", "Endurance");
  const [weeklyGoal, setWeeklyGoal] = useSyncedState("profile-weekly", 3);
  const goalRecs = {
    Endurance:   [["HIIT/LIIT",A.red],["Zumba",A.pink],["Total Body",A.amber]],
    Strength:    [["Total Body",A.amber],["Full Body",A.purple],["Strength",A.orange]],
    Mobility:    [["Yoga",A.green],["Pilates",A.blue],["Meditation",A.purple]],
  };
  return (
    <div style={{ display:"flex", height:"100%", overflow:"hidden" }}>
      <Sidebar active="Profile" onNav={() => {}} />
      <div style={{ flex:1, padding:"28px 32px", overflow:"auto" }}>
        <h1 style={{ fontFamily:"Barlow", fontSize:28, fontWeight:800, color:A.text, margin:"0 0 4px" }}>
          Profile
        </h1>
        <p style={{ fontFamily:"Barlow", fontSize:13, color:A.sub, margin:"0 0 20px" }}>
          Account settings and fitness preferences
        </p>

        {/* Photo card */}
        <div style={{ background:A.card, border:`1px solid ${A.tealDim}`, borderRadius:10,
          padding:"18px 20px", marginBottom:14,
          display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ width:60, height:60, borderRadius:"50%", background:A.tealDim,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontFamily:"Barlow", fontSize:20, fontWeight:700, color:A.text, flexShrink:0 }}>
            {MEMBER_INITIALS}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"Barlow", fontSize:18, fontWeight:700, color:A.text, marginBottom:4 }}>
              {MEMBER_NAME}
            </div>
            <span style={{ background:`${A.teal}18`, color:A.teal, border:`1px solid ${A.tealDim}`,
              borderRadius:20, padding:"2px 10px", fontFamily:"Barlow", fontSize:11, fontWeight:700,
              display:"flex", alignItems:"center", gap:5, width:"fit-content" }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:A.teal }}/>
              MEMBER
            </span>
          </div>
          <button style={{ background:"transparent", border:`1px solid ${A.border}`,
            borderRadius:6, padding:"7px 16px", color:A.sub, cursor:"pointer",
            fontFamily:"Barlow", fontSize:13 }}>Change Photo</button>
        </div>

        {/* Personal info */}
        <div style={{ background:A.card, border:`1px solid ${A.border}`, borderRadius:10,
          padding:"18px 20px", marginBottom:14 }}>
          <div style={{ fontFamily:"Barlow", fontSize:11, fontWeight:700, color:A.sub,
            letterSpacing:"0.1em", marginBottom:14 }}>PERSONAL INFORMATION</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
            {[["FIRST NAME","Madalina"],["LAST NAME","Bulat"]].map(([l,v]) => (
              <div key={l}>
                <div style={{ fontFamily:"Barlow", fontSize:10, fontWeight:600, color:A.sub,
                  letterSpacing:"0.1em", marginBottom:5 }}>{l}</div>
                <input defaultValue={v} style={{ width:"100%", background:A.surface,
                  border:`1px solid ${A.border}`, borderRadius:8, padding:"8px 12px",
                  color:A.text, fontFamily:"Barlow", fontSize:14, outline:"none",
                  boxSizing:"border-box" }}/>
              </div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <div style={{ fontFamily:"Barlow", fontSize:10, fontWeight:600, color:A.sub,
                letterSpacing:"0.1em", marginBottom:5 }}>EMAIL</div>
              <input defaultValue={MEMBER_EMAIL} style={{ width:"100%", background:A.surface,
                border:`1px solid ${A.border}`, borderRadius:8, padding:"8px 12px",
                color:A.text, fontFamily:"Barlow", fontSize:13, outline:"none",
                boxSizing:"border-box" }}/>
            </div>
            <div>
              <div style={{ fontFamily:"Barlow", fontSize:10, fontWeight:600, color:A.sub,
                letterSpacing:"0.1em", marginBottom:5 }}>GOAL</div>
              <select value={goal} onChange={e => setGoal(e.target.value)}
                style={{ width:"100%", background:A.surface, border:`1px solid ${A.border}`,
                borderRadius:8, padding:"8px 12px", color:A.text, fontFamily:"Barlow",
                fontSize:14, outline:"none", cursor:"pointer" }}>
                <option>Endurance</option><option>Strength</option><option>Mobility</option>
              </select>
            </div>
          </div>
        </div>

        {/* Fitness prefs */}
        <div style={{ background:A.card, border:`1px solid ${A.border}`, borderRadius:10,
          padding:"18px 20px", marginBottom:14 }}>
          <div style={{ fontFamily:"Barlow", fontSize:11, fontWeight:700, color:A.sub,
            letterSpacing:"0.1em", marginBottom:14 }}>FITNESS PREFERENCES</div>
          <div style={{ fontFamily:"Barlow", fontSize:10, fontWeight:600, color:A.sub,
            letterSpacing:"0.1em", marginBottom:8 }}>WEEKLY GOAL</div>
          <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:16 }}>
            {[1,2,3,4,5].map(n => (
              <div key={n} onClick={() => setWeeklyGoal(n)} style={{ width:40, height:40, borderRadius:6, border:`1px solid`,
                borderColor: n===weeklyGoal ? A.teal : A.border,
                background: n===weeklyGoal ? `${A.teal}18` : A.surface,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:"Barlow", fontSize:16, fontWeight:700,
                color: n===weeklyGoal ? A.teal : A.sub, cursor:"pointer" }}>{n}</div>
            ))}
            <span style={{ fontFamily:"Barlow", fontSize:13, color:A.sub, marginLeft:4 }}>per week</span>
          </div>
          <div style={{ fontFamily:"Barlow", fontSize:10, fontWeight:600, color:A.sub,
            letterSpacing:"0.1em", marginBottom:8 }}>RECOMMENDED CLASSES</div>
          <div style={{ display:"flex", gap:8, marginBottom:8 }}>
            {(goalRecs[goal] || goalRecs.Endurance).map(([t,c]) => (
              <span key={t} style={{ background:`${c}18`, color:c, border:`1px solid ${c}44`,
                borderRadius:6, padding:"4px 12px", fontFamily:"Barlow", fontSize:12, fontWeight:600 }}>
                {t}
              </span>
            ))}
          </div>
          <div style={{ fontFamily:"Barlow", fontSize:12, color:A.sub }}>
            Based on your <span style={{ color:A.teal }}>{goal}</span> goal
          </div>
        </div>

        <TealBtn onClick={onNext} style={{ padding:"10px 24px" }}>Save Changes</TealBtn>
      </div>
    </div>
  );
}

// ─── DEMO: EMAIL ──────────────────────────────────────────────────────────────
function DemoEmail({ onNext }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: A.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <img
        src={`${import.meta.env.BASE_URL}email-screenshot.jpeg`}
        alt="Booking confirmation email"
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain"
        }}
      />
    </div>
  );
}

// (DemoCalendar removed)

// ─── DEMO: INSTRUCTOR ─────────────────────────────────────────────────────────
function DemoInstructor({ onNext }) {
  const [tab, setTab] = useSyncedState("instructor-tab", "roster");
  return (
    <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div style={{ background:A.sidebar, borderBottom:`1px solid ${A.border}`,
        padding:"12px 24px", display:"flex", alignItems:"center",
        justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Logo size={28} />
          <span style={{ fontFamily:"Barlow", fontSize:15, fontWeight:700, color:A.text }}>JM FitHub</span>
          <span style={{ background:`${A.green}18`, color:A.green, border:`1px solid ${A.green}44`,
            borderRadius:4, padding:"2px 8px", fontFamily:"Barlow", fontSize:10, fontWeight:700,
            marginLeft:4 }}>INSTRUCTOR</span>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {["roster","profile","classes"].map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              style={{ background:tab===t?A.green:"transparent",
                border:`1px solid ${tab===t?A.green:A.border}`, borderRadius:6,
                padding:"6px 16px", color:tab===t?"#fff":A.sub,
                cursor:"pointer", fontFamily:"Barlow", fontSize:13, fontWeight:600, textTransform:"capitalize" }}>
              {t}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:30, height:30, borderRadius:"50%", background:"#2a5a3a",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontFamily:"Barlow", fontSize:12, fontWeight:700, color:A.text }}>AJ</div>
          <div>
            <div style={{ fontFamily:"Barlow", fontSize:13, fontWeight:600, color:A.text }}>Alissa</div>
            <div style={{ fontFamily:"Barlow", fontSize:11, color:A.green }}>Instructor</div>
          </div>
        </div>
      </div>
      <div style={{ flex:1, overflow:"auto", padding:24 }}>
        {tab==="roster" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
              <div>
                <h2 style={{ fontFamily:"Barlow", fontSize:20, fontWeight:800, color:A.text, margin:"0 0 3px" }}>
                  HIIT/LIIT — Roster
                </h2>
                <span style={{ fontFamily:"Barlow", fontSize:13, color:A.sub }}>
                  Monday 12:00 PM · 8/20 enrolled
                </span>
              </div>
            </div>
            {ROSTER.map((r,i)=>(
              <div key={i} style={{ background:A.card, border:`1px solid ${A.border}`,
                borderRadius:8, padding:"12px 16px", marginBottom:8,
                display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:34, height:34, borderRadius:"50%",
                  background:r.status==="Confirmed"?`${A.teal}22`:`${A.amber}22`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:"Barlow", fontSize:11, fontWeight:700,
                  color:r.status==="Confirmed"?A.teal:A.amber }}>{r.init}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"Barlow", fontSize:13, fontWeight:600, color:A.text }}>{r.name}</div>
                  <div style={{ fontFamily:"Barlow", fontSize:12, color:A.sub }}>{r.email}</div>
                </div>
                <span style={{ background:r.status==="Confirmed"?`${A.teal}18`:`${A.amber}18`,
                  color:r.status==="Confirmed"?A.teal:A.amber,
                  border:`1px solid ${r.status==="Confirmed"?A.teal:A.amber}44`,
                  borderRadius:20, padding:"3px 10px", fontFamily:"Barlow", fontSize:11, fontWeight:700,
                  display:"flex", alignItems:"center", gap:5 }}>
                  {r.status==="Confirmed"?"✅ Confirmed":"⏳ Waitlist"}
                </span>
              </div>
            ))}
            <div style={{ marginTop:16, textAlign:"right" }}>
              <TealBtn onClick={onNext}>System Overview →</TealBtn>
            </div>
          </div>
        )}
        {tab==="profile" && (
          <div style={{ maxWidth:560 }}>
            <div style={{ background:A.card, border:`1px solid ${A.border}`, borderRadius:10, padding:20, marginBottom:14 }}>
              <div style={{ fontFamily:"Barlow", fontSize:11, fontWeight:700, color:A.sub,
                letterSpacing:"0.1em", marginBottom:14 }}>TRAINER PROFILE</div>
              <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
                <div style={{ width:60, height:60, borderRadius:"50%", background:"#2a5a3a",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:"Barlow", fontSize:20, fontWeight:700, color:A.text }}>AJ</div>
                <div>
                  <div style={{ fontFamily:"Barlow", fontSize:17, fontWeight:700, color:A.text }}>Alissa</div>
                  <div style={{ fontFamily:"Barlow", fontSize:12, color:A.green }}>HIIT & Cardio Specialist</div>
                </div>
              </div>
              {[["Bio","Certified NASM trainer with 8 years experience."],
                ["Specializations","HIIT, Cardio, Strength"],
                ["Certifications","NASM CPT, CPR/AED"]].map(([l,v])=>(
                <div key={l} style={{ marginBottom:12 }}>
                  <div style={{ fontFamily:"Barlow", fontSize:10, fontWeight:600, color:A.sub,
                    letterSpacing:"0.1em", marginBottom:5 }}>{l}</div>
                  <input defaultValue={v} style={{ width:"100%", background:A.surface,
                    border:`1px solid ${A.border}`, borderRadius:8, padding:"8px 12px",
                    color:A.text, fontFamily:"Barlow", fontSize:13, outline:"none",
                    boxSizing:"border-box" }}/>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab==="classes" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
              <h2 style={{ fontFamily:"Barlow", fontSize:18, fontWeight:800, color:A.text, margin:0 }}>My Classes</h2>
              <TealBtn small>+ New Class</TealBtn>
            </div>
            {[{title:"HIIT/LIIT",day:"MON",time:"12:00 PM",dur:"55m",left:19,total:20,col:A.red},
              {title:"HIIT/LIIT",day:"THU",time:"12:00 PM",dur:"55m",left:20,total:20,col:A.red}].map((c,i)=>(
              <div key={i} style={{ background:A.card, border:`1px solid ${A.border}`,
                borderLeft:`3px solid ${c.col}`, borderRadius:10, padding:"14px 18px",
                marginBottom:10, display:"flex", alignItems:"center", gap:16 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"Barlow", fontSize:15, fontWeight:700, color:A.text, marginBottom:2 }}>{c.title}</div>
                  <div style={{ fontFamily:"Barlow", fontSize:12, color:A.sub }}>{c.day} · {c.time} · {c.dur}</div>
                </div>
                <div style={{ textAlign:"right", minWidth:80 }}>
                  <div style={{ fontFamily:"Barlow", fontSize:12, color:A.sub, marginBottom:4 }}>
                    {c.total-c.left}/{c.total}
                  </div>
                  <div style={{ height:4, background:A.border, borderRadius:99 }}>
                    <div style={{ width:`${(c.total-c.left)/c.total*100}%`, height:"100%",
                      background:c.col, borderRadius:99 }}/>
                  </div>
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  <TealBtn small>Edit</TealBtn>
                  <RedBtn small>Cancel</RedBtn>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SLIDE: SYSTEM ARCHITECTURE ─────────────────────────────────────────────
function SlideSystem({ onNext }) {
  const layers = [
    {
      title: "Frontend",
      icon: "⚛️",
      color: A.teal,
      items: [
        { name: "React 18 + Vite", desc: "Single-page app with CSS-in-JS" },
        { name: "Role-Based Views", desc: "Associate & Instructor portals" },
        { name: "authFetch()", desc: "JWT Bearer on every request" },
        { name: "SignalR Client", desc: "Real-time booking events" },
      ],
    },
    {
      title: "Backend — ASP.NET Core 9",
      icon: "🔧",
      color: A.purple,
      items: [
        { name: "8 Controllers", desc: "Booking, Class, Auth, Trainer…" },
        { name: "EF Core 9", desc: "9 entities, code-first migrations" },
        { name: "Identity + JWT", desc: "Role claims, 24-hr tokens" },
        { name: "SignalR Hub", desc: "Live booking broadcasts" },
      ],
    },
    {
      title: "Data & Services",
      icon: "🗄️",
      color: A.amber,
      items: [
        { name: "Azure SQL", desc: "Serverless, auto-pause" },
        { name: "Blob Storage", desc: "Avatars, banners, uploads" },
        { name: "SendGrid", desc: "Booking emails & reminders" },
        { name: "App Insights", desc: "Monitoring, failures, KQL" },
      ],
    },
  ];

  return (
    <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column",
      padding:"32px 44px", overflow:"auto", boxSizing:"border-box",
      background:`radial-gradient(ellipse at 50% 0%, ${A.teal}08 0%, transparent 70%)` }}>

      {/* Header */}
      <div style={{ textAlign:"center", marginBottom:28 }}>
        <h1 style={{ fontFamily:"Barlow", fontSize:34, fontWeight:900, color:A.white, margin:"0 0 6px",
          letterSpacing:"-0.01em" }}>System Architecture</h1>
        <p style={{ fontFamily:"Barlow", fontSize:15, color:A.sub, margin:0 }}>
          How the pieces connect — from browser to database
        </p>
      </div>

      {/* User roles */}
      <div style={{ display:"flex", gap:12, justifyContent:"center", marginBottom:16 }}>
        {[{icon:"👤",label:"Associate",color:A.teal},{icon:"🏋️",label:"Instructor",color:A.green},{icon:"🔧",label:"Admin",color:A.purple}].map(u=>(
          <div key={u.label} style={{ background:u.color+"12", border:"1px solid "+u.color+"44",
            borderRadius:24, padding:"7px 20px", display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:15 }}>{u.icon}</span>
            <span style={{ fontFamily:"Barlow", fontSize:14, fontWeight:700, color:u.color }}>{u.label}</span>
          </div>
        ))}
      </div>

      {/* Layers */}
      <div style={{ display:"flex", flexDirection:"column", gap:12, flex:1 }}>
        {layers.map((layer, li) => (
          <div key={layer.title}>
            {/* Arrow connector */}
            {li > 0 && (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
                gap:8, margin:"0 0 12px" }}>
                <div style={{ flex:1, maxWidth:120, height:1, background:A.border }}/>
                <div style={{ background:A.sidebar, border:"1px solid "+A.border,
                  borderRadius:20, padding:"4px 14px", display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontFamily:"Barlow", fontSize:11, fontWeight:700, color:A.teal }}>▼</span>
                  <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:A.sub }}>
                    {li === 1 ? "REST / JSON + WebSocket" : "EF Core / SAS Tokens"}
                  </span>
                </div>
                <div style={{ flex:1, maxWidth:120, height:1, background:A.border }}/>
              </div>
            )}

            {/* Layer box */}
            <div style={{ background:layer.color+"06", border:"1px solid "+layer.color+"28",
              borderRadius:12, padding:"16px 20px" }}>
              {/* Layer header */}
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                <span style={{ fontSize:20 }}>{layer.icon}</span>
                <span style={{ fontFamily:"Barlow", fontSize:16, fontWeight:800, color:layer.color,
                  letterSpacing:"0.03em" }}>{layer.title}</span>
              </div>
              {/* Items grid */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:10 }}>
                {layer.items.map(item => (
                  <div key={item.name} style={{ background:A.card, borderRadius:10,
                    padding:"12px 14px", borderTop:`2px solid ${layer.color}` }}>
                    <div style={{ fontFamily:"Barlow", fontSize:14, fontWeight:700,
                      color:A.white, marginBottom:3 }}>{item.name}</div>
                    <div style={{ fontFamily:"Barlow", fontSize:12, color:A.sub,
                      lineHeight:1.45 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop:14, textAlign:"right" }}>
        <TealBtn onClick={onNext}>ERD Diagram →</TealBtn>
      </div>
    </div>
  );
}

// ─── SLIDE: ERD DIAGRAM ───────────────────────────────────────────────────────
const ERD_SURFACE  = "#111918";
const ERD_BORDER   = "#1e2e2b";
const ERD_HEADER   = "#0d1f1c";
const ERD_LINE     = "#1e3330";
const ERD_MUTED    = "#4a7870";
const ERD_DIM      = "#2a4a46";
const ERD_TEXT     = "#d4ede9";
const ERD_SUBTEXT  = "#7aada6";

const ERD_ACCENT = {
  ApplicationUser:   "#00a896",
  TrainerProfile:    "#7b6fdd",
  TrainingClass:     "#f0a500",
  Booking:           "#e05555",
  AssociateProgress: "#00a896",
  Notification:      "#7b6fdd",
  FailedEmail:       "#888",
};

const ERD_ENTITIES = [
  {
    name: "ApplicationUser",
    fields: [
      { name: "Id",                  type: "string",   pk: true },
      { name: "FirstName",           type: "string" },
      { name: "LastName",            type: "string" },
      { name: "Email",               type: "string" },
      { name: "Department",          type: "string?" },
      { name: "FitnessGoal",         type: "string?" },
      { name: "WeeklyGoal",          type: "int" },
      { name: "MustChangePassword",  type: "bool" },
      { name: "AvatarUrl",           type: "string?" },
    ],
  },
  {
    name: "TrainerProfile",
    fields: [
      { name: "Id",              type: "int",    pk: true },
      { name: "UserId",          type: "string", fk: "ApplicationUser" },
      { name: "Bio",             type: "string?" },
      { name: "Specializations", type: "string?" },
      { name: "BadgeColor",      type: "string?" },
      { name: "AvatarUrl",       type: "string?" },
      { name: "LinkedIn",        type: "string?" },
      { name: "Certification",   type: "string?" },
      { name: "IsVerified",      type: "bool" },
    ],
  },
  {
    name: "TrainingClass",
    fields: [
      { name: "Id",               type: "int",      pk: true },
      { name: "TrainerProfileId", type: "int",      fk: "TrainerProfile" },
      { name: "Title",            type: "string" },
      { name: "ClassType",        type: "string" },
      { name: "StartTime",        type: "DateTime" },
      { name: "DurationMinutes",  type: "int" },
      { name: "MaxCapacity",      type: "int" },
      { name: "Location",         type: "string?" },
      { name: "Status",           type: "enum" },
      { name: "IsPublished",      type: "bool" },
    ],
  },
  {
    name: "Booking",
    fields: [
      { name: "Id",               type: "int",      pk: true },
      { name: "AssociateUserId",  type: "string",   fk: "ApplicationUser" },
      { name: "TrainingClassId",  type: "int",      fk: "TrainingClass" },
      { name: "Status",           type: "enum" },
      { name: "CalendarUid",      type: "Guid" },
      { name: "BookedAt",         type: "DateTime" },
      { name: "CancelledAt",      type: "DateTime?" },
    ],
  },
  {
    name: "AssociateProgress",
    fields: [
      { name: "Id",                    type: "int",      pk: true },
      { name: "UserId",                type: "string",   fk: "ApplicationUser" },
      { name: "TotalClassesAttended",  type: "int" },
      { name: "CurrentStreak",         type: "int" },
      { name: "LongestStreak",         type: "int" },
      { name: "LastUpdated",           type: "DateTime" },
    ],
  },
  {
    name: "Notification",
    fields: [
      { name: "Id",         type: "int",      pk: true },
      { name: "UserId",     type: "string",   fk: "ApplicationUser" },
      { name: "Title",      type: "string" },
      { name: "Message",    type: "string" },
      { name: "Type",       type: "string?" },
      { name: "IsRead",     type: "bool" },
      { name: "CreatedAt",  type: "DateTime" },
    ],
  },
  {
    name: "FailedEmail",
    fields: [
      { name: "Id",               type: "int",      pk: true },
      { name: "ToEmail",          type: "string" },
      { name: "Subject",          type: "string" },
      { name: "HtmlBody",         type: "string" },
      { name: "AttachmentName",   type: "string?" },
      { name: "RetryCount",       type: "int" },
      { name: "LastAttempt",      type: "DateTime?" },
      { name: "CreatedAt",        type: "DateTime" },
    ],
  },
];

const ERD_POSITIONS = {
  ApplicationUser:   { x: 340, y: 10  },
  TrainerProfile:    { x: 60,  y: 160 },
  TrainingClass:     { x: 620, y: 185 },
  Booking:           { x: 620, y: 10  },
  AssociateProgress: { x: 340, y: 280 },
  Notification:      { x: 620, y: 420 },
  FailedEmail:       { x: 60,  y: 400 },
};

const ERD_CARD_W = 200;
const ERD_ROW_H  = 19;
const ERD_HDR_H  = 26;

function erdCardHeight(entity) {
  return ERD_HDR_H + entity.fields.length * ERD_ROW_H + 8;
}

function erdCardEdge(entityName, edge) {
  const pos  = ERD_POSITIONS[entityName];
  const ent  = ERD_ENTITIES.find(e => e.name === entityName);
  const h    = erdCardHeight(ent);
  switch (edge) {
    case "top":    return { x: pos.x + ERD_CARD_W / 2, y: pos.y };
    case "bottom": return { x: pos.x + ERD_CARD_W / 2, y: pos.y + h };
    case "left":   return { x: pos.x,                  y: pos.y + h / 2 };
    case "right":  return { x: pos.x + ERD_CARD_W,     y: pos.y + h / 2 };
    default:       return { x: pos.x + ERD_CARD_W / 2, y: pos.y + h / 2 };
  }
}

const ERD_RELATIONS = [
  { from:"TrainerProfile",    fromEdge:"top",    to:"ApplicationUser",  toEdge:"left",   label:"1 : 1",  color: ERD_ACCENT.TrainerProfile },
  { from:"TrainingClass",     fromEdge:"left",   to:"TrainerProfile",   toEdge:"right",  label:"N : 1",  color: ERD_ACCENT.TrainingClass },
  { from:"Booking",           fromEdge:"left",   to:"ApplicationUser",  toEdge:"right",  label:"N : 1",  color: ERD_ACCENT.Booking },
  { from:"Booking",           fromEdge:"bottom", to:"TrainingClass",    toEdge:"top",    label:"N : 1",  color: ERD_ACCENT.Booking },
  { from:"AssociateProgress", fromEdge:"top",    to:"ApplicationUser",  toEdge:"bottom", label:"1 : 1",  color: ERD_ACCENT.AssociateProgress },
  { from:"Notification",      fromEdge:"top",    to:"TrainingClass",    toEdge:"bottom", label:"N : 1",  color: ERD_ACCENT.Notification },
];

function erdOrthogonalPath(from, to) {
  const fx = from.x, fy = from.y;
  const tx = to.x,   ty = to.y;
  const r  = 8;
  if (Math.abs(ty - fy) < 20) return `M ${fx} ${fy} L ${tx} ${ty}`;
  if (Math.abs(tx - fx) < 20) return `M ${fx} ${fy} L ${tx} ${ty}`;
  const cx = tx, cy = fy;
  const dx1 = cx > fx ? -r : r;
  const dy2 = ty > cy ? r : -r;
  return `M ${fx} ${fy} L ${cx + dx1} ${fy} Q ${cx} ${fy} ${cx} ${fy + dy2} L ${cx} ${ty}`;
}

function ErdCard({ entity, active, onHover }) {
  const pos    = ERD_POSITIONS[entity.name];
  const accent = ERD_ACCENT[entity.name] || ERD_MUTED;
  const h      = erdCardHeight(entity);
  const isActive = active === entity.name;

  return (
    <g
      data-entity={entity.name}
      onMouseEnter={() => onHover(entity.name)}
      onMouseLeave={() => onHover(null)}
      style={{ cursor: "default" }}
    >
      <rect x={pos.x + 3} y={pos.y + 3} width={ERD_CARD_W} height={h} rx={8} fill="rgba(0,0,0,0.5)" />
      <rect
        x={pos.x}
        y={pos.y}
        width={ERD_CARD_W}
        height={h}
        rx={8}
        fill={ERD_SURFACE}
        stroke={isActive ? accent : ERD_BORDER}
        strokeWidth={isActive ? 1.5 : 1}
      />
      <rect x={pos.x} y={pos.y} width={ERD_CARD_W} height={ERD_HDR_H} rx={8} fill={ERD_HEADER} />
      <rect x={pos.x} y={pos.y + ERD_HDR_H - 8} width={ERD_CARD_W} height={8} fill={ERD_HEADER} />
      <rect x={pos.x} y={pos.y} width={3} height={h} rx={1.5} fill={accent} />

      <text
        x={pos.x + 14}
        y={pos.y + 20}
        fontFamily="JetBrains Mono"
        fontSize={11}
        fontWeight={600}
        fill={isActive ? accent : ERD_TEXT}
      >
        {entity.name}
      </text>

      <line
        x1={pos.x + 1}
        y1={pos.y + ERD_HDR_H}
        x2={pos.x + ERD_CARD_W - 1}
        y2={pos.y + ERD_HDR_H}
        stroke={ERD_BORDER}
        strokeWidth={1}
      />

      {entity.fields.map((field, i) => {
        const fy = pos.y + ERD_HDR_H + i * ERD_ROW_H;
        const isPK = field.pk;
        const isFK = !!field.fk;
        const fieldColor = isPK ? "#f0a500" : isFK ? accent : ERD_SUBTEXT;
        const badge = isPK ? "PK" : isFK ? "FK" : null;

        return (
          <g key={field.name}>
            {isActive && (
              <rect
                x={pos.x + 1}
                y={fy + 1}
                width={ERD_CARD_W - 2}
                height={ERD_ROW_H - 1}
                fill={`${accent}08`}
              />
            )}

            <line
              x1={pos.x + 1}
              y1={fy + ERD_ROW_H}
              x2={pos.x + ERD_CARD_W - 1}
              y2={fy + ERD_ROW_H}
              stroke={ERD_LINE}
              strokeWidth={0.5}
            />

            {badge && (
              <>
                <rect
                  x={pos.x + 8}
                  y={fy + 5}
                  width={20}
                  height={12}
                  rx={3}
                  fill={`${fieldColor}20`}
                  stroke={`${fieldColor}40`}
                  strokeWidth={0.5}
                />
                <text
                  x={pos.x + 18}
                  y={fy + 15}
                  fontFamily="JetBrains Mono"
                  fontSize={7}
                  fontWeight={600}
                  fill={fieldColor}
                  textAnchor="middle"
                >
                  {badge}
                </text>
              </>
            )}

            <text
              x={pos.x + 34}
              y={fy + 15}
              fontFamily="JetBrains Mono"
              fontSize={9.5}
              fontWeight={isPK || isFK ? 500 : 400}
              fill={fieldColor}
              opacity={isPK || isFK ? 1 : 0.85}
            >
              {field.name}
            </text>

            <text
              x={pos.x + ERD_CARD_W - 8}
              y={fy + 15}
              fontFamily="JetBrains Mono"
              fontSize={8}
              fontWeight={400}
              fill={ERD_DIM}
              textAnchor="end"
              opacity={0.8}
            >
              {field.type}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function ErdRelLine({ rel, active }) {
  const fromPt = erdCardEdge(rel.from, rel.fromEdge);
  const toPt   = erdCardEdge(rel.to,   rel.toEdge);
  const d      = erdOrthogonalPath(fromPt, toPt);
  const isActive = active === rel.from || active === rel.to;
  const col    = isActive ? rel.color : ERD_BORDER;
  const op     = isActive ? 1 : 0.45;
  const mx = (fromPt.x + toPt.x) / 2;
  const my = (fromPt.y + toPt.y) / 2;
  return (
    <g opacity={op} style={{ transition: "opacity 0.2s" }}>
      {isActive && <path d={d} fill="none" stroke={col} strokeWidth={6} opacity={0.12} strokeLinecap="round" />}
      <path d={d} fill="none" stroke={col} strokeWidth={1.5}
        strokeDasharray={isActive ? "none" : "4 3"} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={fromPt.x} cy={fromPt.y} r={3} fill={col} />
      <circle cx={toPt.x} cy={toPt.y} r={3} fill="none" stroke={col} strokeWidth={1.5} />
      {isActive && (
        <g>
          <rect x={mx - 18} y={my - 9} width={36} height={16} rx={4}
            fill={ERD_SURFACE} stroke={col} strokeWidth={1} opacity={0.95} />
          <text x={mx} y={my + 4} fontFamily="IBM Plex Mono" fontSize={8.5} fontWeight={600}
            fill={col} textAnchor="middle">{rel.label}</text>
        </g>
      )}
    </g>
  );
}

function ErdLegend() {
  const items = [
    { color: "#f0a500", label: "Primary Key", badge: "PK" },
    { color: ERD_MUTED,  label: "Foreign Key", badge: "FK" },
    { color: ERD_SUBTEXT, label: "Column",     badge: "  " },
  ];
  return (
    <g transform="translate(20, 20)">
      <rect x={0} y={0} width={160} height={72} rx={8} fill={ERD_SURFACE} stroke={ERD_BORDER} strokeWidth={1} />
      <text x={12} y={18} fontFamily="IBM Plex Mono" fontSize={9} fontWeight={600}
        fill={ERD_MUTED} letterSpacing={1}>LEGEND</text>
      {items.map((it, i) => (
        <g key={it.label} transform={`translate(12, ${28 + i * 16})`}>
          <rect x={0} y={-7} width={14} height={10} rx={2}
            fill={`${it.color}20`} stroke={`${it.color}60`} strokeWidth={0.5} />
          <text x={2.5} y={1} fontFamily="IBM Plex Mono" fontSize={7}
            fontWeight={600} fill={it.color}>{it.badge}</text>
          <text x={20} y={1} fontFamily="IBM Plex Sans" fontSize={10}
            fill={ERD_SUBTEXT}>{it.label}</text>
        </g>
      ))}
    </g>
  );
}

function SlideERD({ onNext }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#0c1312",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <img
        src={`${import.meta.env.BASE_URL}erd.png`}
        alt="Entity Relationship Diagram"
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain"
        }}
      />
    </div>
  );
}
// ─── SLIDE: AZURE INFRASTRUCTURE ─────────────────────────────────────────────
function SlideAzure({ onNext }) {
  const items = [
    { icon:"🌐", title:"App Service", desc:"Hosts the ASP.NET Core 9 backend API on a B1 plan with always-on enabled. Handles authentication, booking logic, email triggers, and all REST endpoints. Deployed via GitHub Actions publish profile.", color:A.teal },
    { icon:"⚡", title:"Static Web App", desc:"Serves the React 18 + Vite frontend through Azure's global CDN. Automatic edge distribution ensures fast load times. Deployed from GitHub on every push to main via deployment token.", color:A.green },
    { icon:"🗄️", title:"Azure SQL Database", desc:"Serverless tier database that auto-pauses after 1 hour of inactivity to save resources. Stores all entities managed by Entity Framework Core 9 with code-first migrations. Firewall allows Azure service access.", color:A.amber },
    { icon:"📦", title:"Blob Storage", desc:"Standard LRS storage with three containers: trainer-avatars and class-banner for public-read content, plus member-avatar secured with SAS tokens generated by the API on demand.", color:A.blue },
    { icon:"📊", title:"Application Insights", desc:"Full observability with live metrics, request and dependency tracking, exception logging, and custom KQL dashboards. Connected to a Log Analytics workspace for advanced querying.", color:A.red },
    { icon:"🔐", title:"Configuration & Secrets", desc:"App Settings store sensitive values like JWT signing keys, SendGrid API key, and Azure SQL connection strings. All secrets are managed through the Azure Portal — never committed to source control.", color:A.purple },
  ];
  return (
    <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column",
      alignItems:"center", position:"relative", overflow:"auto", padding:"36px 40px" }}>
      <div style={{ position:"absolute", inset:0,
        background:`radial-gradient(ellipse 80% 60% at 50% 30%, ${A.teal}10 0%, transparent 65%)` }}/>
      <div style={{ position:"relative", width:"100%", maxWidth:860 }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontFamily:"Barlow", fontSize:10, fontWeight:700, color:A.sub,
            letterSpacing:"0.2em", marginBottom:6 }}>INFRASTRUCTURE</div>
          <h1 style={{ fontFamily:"Barlow Condensed", fontSize:52, fontWeight:900,
            color:A.text, margin:"0 0 6px", letterSpacing:"-0.01em" }}>Azure Infrastructure</h1>
          <p style={{ fontFamily:"Barlow", fontSize:15, color:A.sub, margin:0 }}>
            Resource group: jm-fithub-rg · Region: Central US
          </p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          {items.map(it => (
            <div key={it.title} style={{ background:A.card, border:`1px solid ${A.border}`,
              borderLeft:`3px solid ${it.color}`, borderRadius:10, padding:"18px 20px",
              display:"flex", gap:14, alignItems:"flex-start" }}>
              <span style={{ fontSize:28, lineHeight:1, flexShrink:0 }}>{it.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"Barlow", fontSize:16, fontWeight:700, color:A.text, marginBottom:4 }}>
                  {it.title}
                </div>
                <p style={{ fontFamily:"Barlow", fontSize:13, color:A.sub, margin:0, lineHeight:1.5 }}>
                  {it.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:24, textAlign:"center" }}>
          <TealBtn onClick={onNext} style={{ padding:"12px 32px", fontSize:14 }}>Email Integration →</TealBtn>
        </div>
      </div>
    </div>
  );
}

// ─── SLIDE: SENDGRID / EMAIL / CALENDAR ───────────────────────────────────────
function SlideSendGrid({ onNext }) {
  const items = [
    { icon:"📧", title:"SendGrid API", desc:"On every successful booking, the backend calls the SendGrid API to send a styled HTML confirmation email with class details, instructor info, and a direct cancellation link.", color:A.green },
    { icon:"📅", title:".ics Calendar Invite", desc:"A standard iCalendar file is generated server-side and attached to each confirmation email. Opening it adds the class directly to Outlook, Google Calendar, or Apple Calendar automatically.", color:A.amber },
    { icon:"🔄", title:"Retry Queue", desc:"A BackgroundService polls the FailedEmails table every 5 minutes, reattempting delivery up to 3 times before marking permanently failed. No emails are silently lost.", color:A.red },
    { icon:"🎨", title:"HTML Email Templates", desc:"Emails use a branded HTML template with the FitHub logo, class details, instructor name, calendar attachment button, and a one-click cancellation link — all rendered server-side.", color:A.teal },
    { icon:"📋", title:"Email Flow", desc:"Booking confirmed → SendGrid sends email + .ics → If delivery fails → written to FailedEmails table → RetryWorker picks it up → reattempts up to 3 times → success or marked failed.", color:A.purple },
    { icon:"🔒", title:"Secure Configuration", desc:"The SendGrid API key is stored as an Azure App Setting, never in source code. The email service is injected via dependency injection and can be swapped for testing or other providers.", color:A.blue },
  ];
  return (
    <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column",
      alignItems:"center", position:"relative", overflow:"auto", padding:"36px 40px" }}>
      <div style={{ position:"absolute", inset:0,
        background:`radial-gradient(ellipse 80% 60% at 50% 30%, ${A.green}10 0%, transparent 65%)` }}/>
      <div style={{ position:"relative", width:"100%", maxWidth:860 }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontFamily:"Barlow", fontSize:10, fontWeight:700, color:A.sub,
            letterSpacing:"0.2em", marginBottom:6 }}>INTEGRATIONS</div>
          <h1 style={{ fontFamily:"Barlow Condensed", fontSize:52, fontWeight:900,
            color:A.text, margin:"0 0 6px", letterSpacing:"-0.01em" }}>Email & Calendar</h1>
          <p style={{ fontFamily:"Barlow", fontSize:15, color:A.sub, margin:0 }}>
            SendGrid API · .ics Calendar Invites · Outlook Integration · Retry Queue
          </p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          {items.map(it => (
            <div key={it.title} style={{ background:A.card, border:`1px solid ${A.border}`,
              borderLeft:`3px solid ${it.color}`, borderRadius:10, padding:"18px 20px",
              display:"flex", gap:14, alignItems:"flex-start" }}>
              <span style={{ fontSize:28, lineHeight:1, flexShrink:0 }}>{it.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"Barlow", fontSize:16, fontWeight:700, color:A.text, marginBottom:4 }}>
                  {it.title}
                </div>
                <p style={{ fontFamily:"Barlow", fontSize:13, color:A.sub, margin:0, lineHeight:1.5 }}>
                  {it.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:24, textAlign:"center" }}>
          <TealBtn onClick={onNext} style={{ padding:"12px 32px", fontSize:14 }}>GitHub CI/CD →</TealBtn>
        </div>
      </div>
    </div>
  );
}

// ─── SLIDE: GITHUB CI/CD ──────────────────────────────────────────────────────
function SlideCICD({ onNext }) {
  const items = [
    { icon:"🔧", title:"Backend Pipeline", desc:"Triggered on every push to main. Restores NuGet packages, builds the .NET 9 solution in Release mode, publishes artifacts, then deploys directly to Azure App Service using the publish profile stored as a GitHub secret.", color:A.purple },
    { icon:"⚡", title:"Frontend Pipeline", desc:"Also triggered on push to main and on pull requests for preview deployments. Runs npm install, Vite build, then deploys the /dist output to Azure Static Web Apps via deployment token. PR previews are auto-cleaned on close.", color:A.green },
    ];
  return (
    <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column",
      alignItems:"center", position:"relative", overflow:"auto", padding:"36px 40px" }}>
      <div style={{ position:"absolute", inset:0,
        background:`radial-gradient(ellipse 80% 60% at 50% 30%, ${A.purple}10 0%, transparent 65%)` }}/>
      <div style={{ position:"relative", width:"100%", maxWidth:860 }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontFamily:"Barlow", fontSize:10, fontWeight:700, color:A.sub,
            letterSpacing:"0.2em", marginBottom:6 }}>DEVOPS</div>
          <h1 style={{ fontFamily:"Barlow Condensed", fontSize:52, fontWeight:900,
            color:A.text, margin:"0 0 6px", letterSpacing:"-0.01em" }}>GitHub CI/CD</h1>
          <p style={{ fontFamily:"Barlow", fontSize:15, color:A.sub, margin:0 }}>
            Two independent pipelines — push to main triggers both
          </p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          {items.map(it => (
            <div key={it.title} style={{ background:A.card, border:`1px solid ${A.border}`,
              borderLeft:`3px solid ${it.color}`, borderRadius:10, padding:"18px 20px",
              display:"flex", gap:14, alignItems:"flex-start" }}>
              <span style={{ fontSize:28, lineHeight:1, flexShrink:0 }}>{it.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"Barlow", fontSize:16, fontWeight:700, color:A.text, marginBottom:4 }}>
                  {it.title}
                </div>
                <p style={{ fontFamily:"Barlow", fontSize:13, color:A.sub, margin:0, lineHeight:1.5 }}>
                  {it.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:24, textAlign:"center" }}>
          <TealBtn onClick={onNext} style={{ padding:"12px 32px", fontSize:14 }}>What's Next →</TealBtn>
        </div>
      </div>
    </div>
  );
}

// ─── SLIDE: WHAT'S NEXT (ROADMAP) ─────────────────────────────────────────────
function SlideRoadmap({ onNext }) {
  const items = [
    { icon:"🔐", title:"Microsoft SSO", desc:"Replace manual email login with Microsoft 365 Single Sign-On via MSAL + Azure AD. One click to authenticate.", color:A.teal, status:"In Progress" },
    { icon:"🤝", title:"Associate Connections", desc:"Follow colleagues, see who's attending the same classes, and form workout groups to stay motivated together.", color:A.green, status:"Planned" },
    { icon:"📊", title:"Leaderboard", desc:"Department and company-wide leaderboards with monthly challenges to drive friendly competition.", color:A.purple, status:"Planned" },
    { icon:"📱", title:"Mobile PWA", desc:"Progressive Web App support with offline schedule viewing, home screen install, and push notifications.", color:A.pink, status:"Exploring" },
  ];
  return (
    <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column",
      alignItems:"center", position:"relative", overflow:"auto", padding:"36px 40px" }}>
      <div style={{ position:"absolute", inset:0,
        background:`radial-gradient(ellipse 80% 60% at 50% 30%, ${A.teal}10 0%, transparent 65%)` }}/>
      <div style={{ position:"relative", width:"100%", maxWidth:860 }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontFamily:"Barlow", fontSize:10, fontWeight:700, color:A.sub,
            letterSpacing:"0.2em", marginBottom:6 }}>LOOKING AHEAD</div>
          <h1 style={{ fontFamily:"Barlow Condensed", fontSize:52, fontWeight:900,
            color:A.text, margin:"0 0 6px", letterSpacing:"-0.01em" }}>What's Next</h1>
          <p style={{ fontFamily:"Barlow", fontSize:15, color:A.sub, margin:0 }}>
            Features and enhancements on the FitHub roadmap
          </p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          {items.map(it => (
            <div key={it.title} style={{ background:A.card, border:`1px solid ${A.border}`,
              borderLeft:`3px solid ${it.color}`, borderRadius:10, padding:"18px 20px",
              display:"flex", gap:14, alignItems:"flex-start" }}>
              <span style={{ fontSize:28, lineHeight:1, flexShrink:0 }}>{it.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                  <span style={{ fontFamily:"Barlow", fontSize:16, fontWeight:700, color:A.text }}>
                    {it.title}
                  </span>
                  <span style={{ fontFamily:"Barlow", fontSize:9, fontWeight:700,
                    letterSpacing:"0.08em", padding:"2px 8px", borderRadius:20,
                    background: it.status==="In Progress" ? `${A.teal}22` : it.status==="Planned" ? `${A.amber}18` : `${A.purple}18`,
                    color: it.status==="In Progress" ? A.teal : it.status==="Planned" ? A.amber : A.purple,
                    border:`1px solid ${it.status==="In Progress" ? A.teal : it.status==="Planned" ? A.amber : A.purple}44` }}>
                    {it.status.toUpperCase()}
                  </span>
                </div>
                <p style={{ fontFamily:"Barlow", fontSize:13, color:A.sub, margin:0, lineHeight:1.5 }}>
                  {it.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:24, textAlign:"center" }}>
          <TealBtn onClick={onNext} style={{ padding:"12px 32px", fontSize:14 }}>Thank You →</TealBtn>
        </div>
      </div>
    </div>
  );
}

// ─── SLIDE: THANK YOU ─────────────────────────────────────────────────────────
function SlideThankYou({ onNext }) {
  return (
    <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0,
        background:`radial-gradient(ellipse 70% 60% at 50% 45%, ${A.teal}18 0%, transparent 65%)` }}/>
      <div style={{ position:"absolute", inset:0, opacity:0.04,
        backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 40px,#fff 40px,#fff 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,#fff 40px,#fff 41px)" }}/>
      <div style={{ position:"relative", textAlign:"center", maxWidth:680 }}>
        <Logo size={64} />
        <h1 style={{ fontFamily:"Barlow Condensed", fontSize:72, fontWeight:900,
          color:A.text, margin:"20px 0 8px", letterSpacing:"-0.01em" }}>
          THANK YOU
        </h1>
        <p style={{ fontFamily:"Barlow", fontSize:18, color:A.sub, margin:"0 0 36px" }}>
          JM FitHub — Built for JM Family Enterprises
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:36 }}>
          {[["React 18 + Vite","Frontend"],["ASP.NET Core 9","Backend"],["Azure SQL","Database"],
            ["Blob Storage","Files"],["SendGrid","Emails"],["GitHub Actions","CI/CD"]].map(([t,s])=>(
            <div key={t} style={{ background:A.card, border:`1px solid ${A.border}`,
              borderRadius:8, padding:"10px 14px" }}>
              <div style={{ fontFamily:"Barlow", fontSize:13, fontWeight:700, color:A.text }}>{t}</div>
              <div style={{ fontFamily:"Barlow", fontSize:11, color:A.sub }}>{s}</div>
            </div>
          ))}
        </div>
        <TealBtn onClick={onNext} style={{ padding:"12px 32px", fontSize:14 }}>← Restart Demo</TealBtn>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
const CHANNEL_NAME = "fithub-presenter-sync";

function usePresenterSync(idx, setIdx) {
  const channelRef = useRef(null);
  const audienceWinRef = useRef(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);
    return () => channelRef.current.close();
  }, []);

  // broadcast slide index whenever it changes
  useEffect(() => {
    if (channelRef.current) channelRef.current.postMessage({ type:"slide", idx });
  }, [idx]);

  // listen for incoming slide changes (audience listens to presenter)
  useEffect(() => {
    if (!channelRef.current) return;
    const handler = e => {
      if (e.data?.type === "slide") setIdx(e.data.idx);
    };
    channelRef.current.addEventListener("message", handler);
    return () => channelRef.current.removeEventListener("message", handler);
  }, [setIdx]);

  function openAudienceWindow() {
    const url = window.location.origin + window.location.pathname + "?mode=audience";
    audienceWinRef.current = window.open(url, "fithub-audience",
      "toolbar=no,menubar=no,scrollbars=no,resizable=yes");
  }

  function closeAudienceWindow() {
    if (audienceWinRef.current && !audienceWinRef.current.closed) {
      audienceWinRef.current.close();
    }
    audienceWinRef.current = null;
  }

  return { openAudienceWindow, closeAudienceWindow };
}

// Elapsed timer for presenter view
function useTimer(running) {
  const [elapsed, setElapsed] = useState(0);
  const start = useRef(null);
  useEffect(() => {
    if (!running) { setElapsed(0); start.current = null; return; }
    start.current = Date.now();
    const id = setInterval(() => setElapsed(Date.now() - start.current), 1000);
    return () => clearInterval(id);
  }, [running]);
  const mins = Math.floor(elapsed / 60000);
  const secs = Math.floor((elapsed % 60000) / 1000);
  return `${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;
}

// ─── AUDIENCE VIEW (opened in separate window, full-screen slide only) ────────
function AudienceApp() {
  const [idx, setIdx] = useState(0);
  const slide = SLIDES[idx];

  // Strip ?mode=audience from the URL bar so it looks clean
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("mode");
    window.history.replaceState({}, "", url.pathname);
  }, []);

  // Listen for slide changes from presenter
  useEffect(() => {
    const ch = new BroadcastChannel(CHANNEL_NAME);
    const handler = e => {
      if (e.data?.type === "slide") setIdx(e.data.idx);
    };
    ch.addEventListener("message", handler);
    return () => { ch.removeEventListener("message", handler); ch.close(); };
  }, []);

  function renderSlide() {
    const noop = () => {};
    switch(slide.id) {
      case "welcome":    return <SlideWelcome onNext={noop}/>;
      case "screenshot": return <SlideScreenshot onNext={noop}/>;
      case "title":      return <SlideTitle onNext={noop}/>;
      case "schedule":   return <DemoSchedule onNext={noop}/>;
      case "bookings":   return <DemoBookings onNext={noop}/>;
      case "email":      return <DemoEmail onNext={noop}/>;
      case "progress":   return <DemoProgress onNext={noop}/>;
      case "locations":  return <DemoLocations onNext={noop}/>;
      case "profile":    return <DemoProfile onNext={noop}/>;
      case "instructor": return <DemoInstructor onNext={noop}/>;
      case "system":     return <SlideSystem onNext={noop}/>;
      case "erd":        return <SlideERD onNext={noop}/>;
      case "azure":      return <SlideAzure onNext={noop}/>;
      case "sendgrid":   return <SlideSendGrid onNext={noop}/>;
      case "cicd":       return <SlideCICD onNext={noop}/>;
      case "roadmap":    return <SlideRoadmap onNext={noop}/>;
      case "thankyou":   return <SlideThankYou onNext={noop}/>;
      default:           return null;
    }
  }

  return (
    <div style={{ width:"100vw", height:"100vh", background:A.bg, color:A.text,
      fontFamily:"Barlow, sans-serif", overflow:"hidden" }}>
      {renderSlide()}
    </div>
  );
}

// ─── PRESENTER VIEW (notes, current slide, next slide preview, timer) ─────────
function PresenterPanel({ idx, slide, goNext, goPrev, goTo, elapsed, onEndPresentation, renderSlide }) {
  const nextSlide = idx < SLIDES.length - 1 ? SLIDES[idx + 1] : null;

  return (
    <div style={{ width:"100vw", height:"100vh", background:"#0a0f0e", color:A.text,
      fontFamily:"Barlow, sans-serif", display:"flex", flexDirection:"column", overflow:"hidden", userSelect:"none" }}>

      {/* Top bar */}
      <div style={{ height:44, background:A.sidebar, borderBottom:`1px solid ${A.border}`,
        display:"flex", alignItems:"center", padding:"0 16px", gap:12, flexShrink:0 }}>
        <Logo size={22}/>
        <span style={{ fontFamily:"Barlow", fontSize:13, fontWeight:700, color:A.text }}>Presenter View</span>
        <div style={{ flex:1 }}/>
        <span style={{ fontFamily:"JetBrains Mono", fontSize:13, fontWeight:600, color:A.teal }}>
          {elapsed}
        </span>
        <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:A.dim, marginLeft:8 }}>
          {idx+1} / {SLIDES.length}
        </span>
        <button onClick={onEndPresentation}
          style={{ marginLeft:12, background:A.red, border:"none", borderRadius:5,
            padding:"5px 14px", fontFamily:"Barlow", fontSize:12, fontWeight:700,
            color:"#fff", cursor:"pointer" }}>End</button>
        <button onClick={() => { if(document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen(); }}
          style={{ background:"transparent", border:`1px solid ${A.border}`, borderRadius:5,
            width:30, height:30, color:A.sub, cursor:"pointer", fontSize:13,
            display:"flex", alignItems:"center", justifyContent:"center" }}
          title="Toggle fullscreen (F11)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
            <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
          </svg>
        </button>
      </div>

      {/* Main area */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        {/* Left: current + next slide previews */}
        <div style={{ flex:"0 0 62%", display:"flex", flexDirection:"column", padding:12, gap:10, overflow:"hidden" }}>
          {/* Current slide */}
          <div style={{ flex:3, position:"relative", borderRadius:8, overflow:"hidden",
            border:`2px solid ${A.teal}`, background:A.bg }}>
            <div style={{ position:"absolute", top:6, left:10, fontFamily:"Barlow", fontSize:10,
              fontWeight:700, color:A.bg, background:A.teal, padding:"2px 8px", borderRadius:4, zIndex:10 }}>
              CURRENT
            </div>
            <div style={{ width:"100%", height:"100%", overflow:"hidden" }}>
              {renderSlide(idx)}
            </div>
          </div>
          {/* Next slide preview */}
          <div style={{ flex:2, position:"relative", borderRadius:8, overflow:"hidden",
            border:`1px solid ${A.border}`, background:A.bg, opacity: nextSlide ? 1 : 0.3 }}>
            <div style={{ position:"absolute", top:6, left:10, fontFamily:"Barlow", fontSize:10,
              fontWeight:700, color:A.sub, background:A.card, padding:"2px 8px", borderRadius:4, zIndex:10 }}>
              {nextSlide ? `NEXT: ${nextSlide.label}` : "END OF PRESENTATION"}
            </div>
            <div style={{ width:"100%", height:"100%", overflow:"hidden" }}>
              {nextSlide ? renderSlide(idx + 1) : (
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%",
                  fontFamily:"Barlow", fontSize:16, color:A.dim }}>No more slides</div>
              )}
            </div>
          </div>
        </div>

        {/* Right: speaker notes + controls */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", borderLeft:`1px solid ${A.border}`,
          background:A.sidebar }}>
          {/* Slide label */}
          <div style={{ padding:"14px 16px 8px", borderBottom:`1px solid ${A.border}` }}>
            <div style={{ fontFamily:"Barlow", fontSize:10, fontWeight:700, letterSpacing:"0.12em",
              color:A.teal, marginBottom:4 }}>SPEAKER NOTES</div>
            <div style={{ fontFamily:"Barlow", fontSize:15, fontWeight:700, color:A.text }}>
              {slide.label}
            </div>
          </div>
          {/* Notes text */}
          <div style={{ flex:1, padding:"12px 16px", overflow:"auto" }}>
            <p style={{ fontFamily:"Barlow", fontSize:15, color:A.sub, lineHeight:1.65, margin:0,
              whiteSpace:"pre-wrap" }}>
              {slide.notes || "No notes for this slide."}
            </p>
          </div>
          {/* Slide navigation */}
          <div style={{ padding:"10px 16px", borderTop:`1px solid ${A.border}`,
            display:"flex", flexDirection:"column", gap:8 }}>
            {/* Dot navigation */}
            <div style={{ display:"flex", gap:3, flexWrap:"wrap" }}>
              {SLIDES.map((s, i) => (
                <button key={s.id} onClick={() => goTo(i)} title={s.label}
                  style={{ width: i===idx?18:8, height:8, borderRadius:4, border:"none",
                    cursor:"pointer", transition:"all 0.18s",
                    background: i===idx?A.teal:i<idx?A.tealDim:A.border, flexShrink:0 }}/>
              ))}
            </div>
            {/* Prev / Next buttons */}
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={goPrev} disabled={idx===0}
                style={{ flex:1, padding:"10px 0", borderRadius:6, border:`1px solid ${A.border}`,
                  background:"transparent", fontFamily:"Barlow", fontSize:13, fontWeight:600,
                  color:idx===0?A.dim:A.sub, cursor:idx===0?"default":"pointer" }}>
                ← Previous
              </button>
              <button onClick={goNext} disabled={idx===SLIDES.length-1}
                style={{ flex:1, padding:"10px 0", borderRadius:6, border:"none",
                  background:idx===SLIDES.length-1?A.dim:A.teal, fontFamily:"Barlow", fontSize:13,
                  fontWeight:700, color:idx===SLIDES.length-1?A.sub:A.bg,
                  cursor:idx===SLIDES.length-1?"default":"pointer" }}>
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // Detect if this is the audience window
  const isAudience = new URLSearchParams(window.location.search).get("mode") === "audience";
  if (isAudience) return <AudienceApp />;

  const [idx, setIdx] = useState(0);
  const [presenting, setPresenting] = useState(false);
  const slide = SLIDES[idx];
  const goNext = useCallback(() => setIdx(i => Math.min(i+1, SLIDES.length-1)), []);
  const goPrev = useCallback(() => setIdx(i => Math.max(i-1, 0)), []);
  const goTo   = useCallback(i => setIdx(i), []);
  const restart= useCallback(() => setIdx(0), []);

  const { openAudienceWindow, closeAudienceWindow } = usePresenterSync(idx, setIdx);
  const elapsed = useTimer(presenting);

  useEffect(() => {
    const h = e => {
      if (e.key==="ArrowRight"||e.key==="ArrowDown") goNext();
      if (e.key==="ArrowLeft"||e.key==="ArrowUp") goPrev();
      if (e.key==="Escape" && presenting) endPresentation();
    };
    window.addEventListener("keydown",h);
    return () => window.removeEventListener("keydown",h);
  });

  function startPresentation() {
    setPresenting(true);
    openAudienceWindow();
  }
  function endPresentation() {
    setPresenting(false);
    closeAudienceWindow();
  }

  function renderSlideAt(i) {
    const s = SLIDES[i];
    const noop = () => {};
    const next = i === idx ? goNext : noop;
    switch(s.id) {
      case "welcome":    return <SlideWelcome onNext={next}/>;
      case "screenshot": return <SlideScreenshot onNext={next}/>;
      case "title":      return <SlideTitle onNext={next}/>;
      case "schedule":   return <DemoSchedule onNext={next}/>;
      case "bookings":   return <DemoBookings onNext={next}/>;
      case "progress":   return <DemoProgress onNext={next}/>;
      case "locations":  return <DemoLocations onNext={next}/>;
      case "profile":    return <DemoProfile onNext={next}/>;
      case "email":      return <DemoEmail onNext={next}/>;
      case "instructor": return <DemoInstructor onNext={next}/>;
      case "system":     return <SlideSystem onNext={next}/>;
      case "erd":        return <SlideERD onNext={next}/>;
      case "azure":      return <SlideAzure onNext={next}/>;
      case "sendgrid":   return <SlideSendGrid onNext={next}/>;
      case "cicd":       return <SlideCICD onNext={next}/>;
      case "roadmap":    return <SlideRoadmap onNext={next}/>;
      case "thankyou":   return <SlideThankYou onNext={i===idx?restart:noop}/>;
      default:           return null;
    }
  }

  // ─── PRESENTER MODE ───────────────────────────────────────────────
  if (presenting) {
    return <PresenterPanel idx={idx} slide={slide} goNext={goNext} goPrev={goPrev}
      goTo={goTo} elapsed={elapsed} onEndPresentation={endPresentation}
      renderSlide={renderSlideAt} />;
  }

  // ─── NORMAL MODE ──────────────────────────────────────────────────
  return (
    <div style={{ width:"100vw", height:"100vh", background:A.bg, color:A.text,
      fontFamily:"Barlow, sans-serif", display:"flex", flexDirection:"column",
      overflow:"hidden", userSelect:"none" }}>
      <div style={{ flex:1, position:"relative", overflow:"hidden" }}>
        {renderSlideAt(idx)}
      </div>
      {/* Nav bar */}
      <div style={{ height:48, background:A.sidebar, borderTop:`1px solid ${A.border}`,
        display:"flex", alignItems:"center", padding:"0 16px", gap:8, flexShrink:0 }}>
        <button onClick={goPrev} disabled={idx===0}
          style={{ background:"transparent", border:`1px solid ${A.border}`, borderRadius:5,
            width:30, height:30, color:idx===0?A.dim:A.sub, cursor:idx===0?"default":"pointer", fontSize:13 }}>←</button>
        <div style={{ flex:1, display:"flex", alignItems:"center", gap:4, overflow:"hidden" }}>
          {SLIDES.map((s,i)=>(
            <button key={s.id} onClick={()=>goTo(i)} title={s.label}
              style={{ flexShrink:0, width:i===idx?22:7, height:7, borderRadius:4, border:"none",
                cursor:"pointer", transition:"all 0.18s",
                background:i===idx?A.teal:i<idx?A.tealDim:A.border }}/>
          ))}
          <span style={{ fontFamily:"Barlow", fontSize:12, color:A.sub, marginLeft:8, whiteSpace:"nowrap" }}>
            {slide.label}
          </span>
        </div>
        <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:A.dim, flexShrink:0 }}>
          {idx+1} / {SLIDES.length}
        </span>
        <button onClick={goNext} disabled={idx===SLIDES.length-1}
          style={{ background:"transparent", border:`1px solid ${A.border}`, borderRadius:5,
            width:30, height:30, color:idx===SLIDES.length-1?A.dim:A.sub,
            cursor:idx===SLIDES.length-1?"default":"pointer", fontSize:13 }}>→</button>
        {/* Present button */}
        <button onClick={startPresentation}
          style={{ marginLeft:4, background:A.teal, border:"none", borderRadius:5,
            padding:"5px 14px", fontFamily:"Barlow", fontSize:12, fontWeight:700,
            color:A.bg, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          Present
        </button>
      </div>
    </div>
  );
}
