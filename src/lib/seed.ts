import type { Candidate, CandidateDoc, DB, DocType, HistoryEvent, PersonalInfo } from "./types";
import { DEFAULT_TERMS, uid } from "./types";

export const SEED_VERSION = 4;

const day = (offset: number, hour = 10) => {
  const d = new Date(Date.now() + offset * 86400000);
  d.setHours(hour, Math.abs((offset * 17) % 60), 0, 0);
  return d.toISOString();
};

const DOC_NAMES: Record<DocType, string> = {
  resume: "Resume.pdf",
  photo: "Passport_Photo.png",
  pan: "PAN_Card.pdf",
  aadhaar: "Aadhaar_Card.pdf",
  education: "Degree_Certificates.pdf",
  experience: "Experience_Letter.pdf",
  address: "Address_Proof.pdf",
  bank: "Cancelled_Cheque.jpg",
};

function docs(allUploaded: boolean, missing: DocType[] = []): CandidateDoc[] {
  const types: DocType[] = ["resume", "photo", "pan", "aadhaar", "education", "experience", "address", "bank"];
  return types.map((t) =>
    allUploaded && !missing.includes(t)
      ? { type: t, status: "uploaded", fileName: DOC_NAMES[t], size: 240000 + (t.length * 57000) % 900000, uploadedAt: day(-1) }
      : { type: t, status: "pending" }
  );
}

const profile = (name: string, email: string, phone: string, gender: string): PersonalInfo => ({
  fullName: name,
  dob: "1994-07-14",
  gender,
  email,
  mobile: phone,
  currentAddress: "221, Lakeview Residency, HSR Layout, Bengaluru 560102",
  permanentAddress: "14, Gandhi Nagar, Indore, Madhya Pradesh 452001",
  emergencyName: "Ramesh " + name.split(" ")[1],
  emergencyPhone: "9876501234",
});

const hist = (events: [number, string, HistoryEvent["kind"]][]): HistoryEvent[] =>
  events.map(([o, label, kind]) => ({ at: day(o), label, kind }));

function cand(c: Omit<Candidate, "id" | "createdAt" | "profile" | "employment" | "government" | "bank" | "docs" | "history"> & Partial<Pick<Candidate, "profile" | "employment" | "government" | "bank" | "docs" | "history" | "createdAt" | "submittedAt">>): Candidate {
  return {
    id: "cand_" + uid(),
    createdAt: day(-14),
    profile: { fullName: "", dob: "", gender: "", email: "", mobile: "", currentAddress: "", permanentAddress: "", emergencyName: "", emergencyPhone: "" },
    employment: { previousEmployer: "", totalExperience: "" },
    government: { pan: "", aadhaar: "", passport: "" },
    bank: { bankName: "", accountNumber: "", ifsc: "" },
    docs: docs(false),
    history: [],
    ...c,
  };
}

const fullForms = (name: string, email: string, phone: string, gender: string, prev: string, exp: string) => ({
  profile: profile(name, email, phone, gender),
  employment: { previousEmployer: prev, totalExperience: exp },
  government: { pan: "ABC" + name.length + "4567K", aadhaar: "8345 9012 77" + (name.length % 10), passport: "" },
  bank: { bankName: "HDFC Bank", accountNumber: "50100" + (230000 + name.length * 417), ifsc: "HDFC0001207" },
});

export function seedDB(): DB {
  const acme = "c_acme";
  const nova = "c_nova";
  const bright = "c_bright";

  const aarav = cand({
    companyId: acme, name: "Aarav Mehta", email: "aarav.mehta@gmail.com", phone: "9812045673",
    position: "Senior Frontend Engineer", department: "Engineering", joiningDate: day(24).slice(0, 10),
    salary: 1850000, reportingManager: "Nikhil Bansal", status: "accepted", token: "demo-aarav-7qk2",
    createdAt: day(-21), submittedAt: day(-12), agreed: true,
    ...fullForms("Aarav Mehta", "aarav.mehta@gmail.com", "9812045673", "Male", "Flipkart", "6 years"),
    docs: docs(true),
    offer: { id: "of_1", number: "OF-2026-011", generatedAt: day(-9), sentAt: day(-9, 15), viewedAt: day(-8), respondedAt: day(-7), status: "accepted" },
    history: hist([[-21, "Candidate created by Priya Deshmukh", "create"], [-21, "Onboarding link sent via email", "info"], [-13, "Registration link opened by candidate", "info"], [-12, "Onboarding information & 8 documents submitted", "success"], [-11, "HR review completed — forwarded for approval", "info"], [-9, "Approved by Arjun Malhotra (HR Manager)", "success"], [-9, "Offer OF-2026-011 generated & emailed", "success"], [-8, "Offer viewed by candidate", "info"], [-7, "Offer accepted 🎉", "success"]]),
  });

  const diya = cand({
    companyId: acme, name: "Diya Sharma", email: "diya.sharma@outlook.com", phone: "9987123450",
    position: "Product Designer", department: "Design", joiningDate: day(30).slice(0, 10),
    salary: 1450000, reportingManager: "Ritika Chandra", status: "offer_sent", token: "demo-diya-4hd8",
    createdAt: day(-18), submittedAt: day(-8), agreed: true,
    ...fullForms("Diya Sharma", "diya.sharma@outlook.com", "9987123450", "Female", "Zoho", "4 years"),
    docs: docs(true),
    offer: { id: "of_2", number: "OF-2026-014", generatedAt: day(-2), sentAt: day(-2, 16), status: "sent" },
    history: hist([[-18, "Candidate created by Priya Deshmukh", "create"], [-18, "Onboarding link sent via email", "info"], [-8, "Onboarding information & 8 documents submitted", "success"], [-4, "HR review completed — forwarded for approval", "info"], [-2, "Approved by Arjun Malhotra (HR Manager)", "success"], [-2, "Offer OF-2026-014 generated & emailed", "success"]]),
  });

  const ishaan = cand({
    companyId: acme, name: "Ishaan Kulkarni", email: "ishaan.k@yahoo.com", phone: "9765012388",
    position: "Backend Engineer", department: "Engineering", joiningDate: day(27).slice(0, 10),
    salary: 1600000, reportingManager: "Nikhil Bansal", status: "offer_viewed", token: "acm-ishaan-1xz4",
    createdAt: day(-16), submittedAt: day(-7), agreed: true,
    ...fullForms("Ishaan Kulkarni", "ishaan.k@yahoo.com", "9765012388", "Male", "TCS", "3.5 years"),
    docs: docs(true),
    offer: { id: "of_3", number: "OF-2026-013", generatedAt: day(-3), sentAt: day(-3, 12), viewedAt: day(-1), status: "viewed" },
    history: hist([[-16, "Candidate created by Priya Deshmukh", "create"], [-16, "Onboarding link sent via email", "info"], [-7, "Onboarding information & 8 documents submitted", "success"], [-3, "Approved by Arjun Malhotra (HR Manager)", "success"], [-3, "Offer OF-2026-013 generated & emailed", "success"], [-1, "Offer viewed by candidate", "info"]]),
  });

  const rohan = cand({
    companyId: acme, name: "Rohan Verma", email: "rohan.verma@gmail.com", phone: "9833456712",
    position: "DevOps Engineer", department: "Infrastructure", joiningDate: day(35).slice(0, 10),
    salary: 1750000, reportingManager: "Sameer Kulkarni", status: "approval_pending", token: "acm-rohan-9ab1",
    createdAt: day(-15), submittedAt: day(-5), agreed: true,
    ...fullForms("Rohan Verma", "rohan.verma@gmail.com", "9833456712", "Male", "Infosys", "5 years"),
    docs: docs(true),
    history: hist([[-15, "Candidate created by Priya Deshmukh", "create"], [-15, "Onboarding link sent via email", "info"], [-5, "Onboarding information & 8 documents submitted", "success"], [-1, "HR review completed — forwarded for approval", "info"]]),
  });

  const sneha = cand({
    companyId: acme, name: "Sneha Iyer", email: "sneha.iyer@gmail.com", phone: "9900112244",
    position: "Data Analyst", department: "Analytics", joiningDate: day(40).slice(0, 10),
    salary: 1200000, reportingManager: "Amit Deshpande", status: "hr_review", token: "acm-sneha-5cd3",
    createdAt: day(-12), submittedAt: day(0, 9), agreed: true,
    ...fullForms("Sneha Iyer", "sneha.iyer@gmail.com", "9900112244", "Female", "Mu Sigma", "2.5 years"),
    docs: docs(true),
    history: hist([[-12, "Candidate created by Priya Deshmukh", "create"], [-12, "Onboarding link sent via email", "info"], [0, "Onboarding information & 8 documents submitted", "success"]]),
  });

  const kabir = cand({
    companyId: acme, name: "Kabir Singh", email: "kabir.singh@gmail.com", phone: "9877003311",
    position: "QA Engineer", department: "Engineering", joiningDate: day(38).slice(0, 10),
    salary: 1100000, reportingManager: "Nikhil Bansal", status: "information_submitted", token: "demo-kabir-2mn5",
    createdAt: day(-6),
    profile: { ...profile("Kabir Singh", "kabir.singh@gmail.com", "9877003311", "Male"), permanentAddress: "88, Model Town, Ludhiana, Punjab 141002", emergencyName: "Harpreet Singh", emergencyPhone: "" },
    employment: { previousEmployer: "Wipro", totalExperience: "2.5 years" },
    government: { pan: "JQXPS8821L", aadhaar: "", passport: "" },
    bank: { bankName: "ICICI Bank", accountNumber: "", ifsc: "" },
    docs: docs(false, []),
    history: hist([[-6, "Candidate created by Priya Deshmukh", "create"], [-6, "Onboarding link sent via email", "info"], [-2, "Registration link opened by candidate", "info"]]),
  });
  // Kabir: partially filled → ~75%
  kabir.docs = kabir.docs.map((d) =>
    ["resume", "photo", "pan", "aadhaar", "education", "experience"].includes(d.type)
      ? { ...d, status: "uploaded" as const, fileName: DOC_NAMES[d.type], size: 310000 + d.type.length * 31000, uploadedAt: day(-1) }
      : d
  );

  const vikram = cand({
    companyId: acme, name: "Vikram Patel", email: "vikram.patel@rediffmail.com", phone: "9811229977",
    position: "Customer Support Lead", department: "Support", joiningDate: day(32).slice(0, 10),
    salary: 950000, reportingManager: "Farida Khan", status: "changes_requested", token: "acm-vikram-8ef2",
    createdAt: day(-13), submittedAt: day(-4), agreed: true,
    ...fullForms("Vikram Patel", "vikram.patel@rediffmail.com", "9811229977", "Male", "Concentrix", "7 years"),
    docs: docs(true, ["pan"]).map((d) => (d.type === "pan" ? { ...d, status: "invalid" as const, fileName: "PAN_Card.pdf", error: "Image is blurry — name not readable", uploadedAt: day(-4) } : d)),
    changeNote: "Hi Vikram, your PAN card scan is not readable. Please re-upload a clearer copy. Everything else looks good!",
    changeItems: ["PAN Card"],
    history: hist([[-13, "Candidate created by Priya Deshmukh", "create"], [-13, "Onboarding link sent via email", "info"], [-4, "Onboarding information submitted", "success"], [-1, "Changes requested by HR — PAN Card re-upload needed", "warning"]]),
  });

  const ananya = cand({
    companyId: acme, name: "Ananya Rao", email: "ananya.rao@gmail.com", phone: "9966554433",
    position: "Marketing Associate", department: "Marketing", joiningDate: day(45).slice(0, 10),
    salary: 850000, reportingManager: "Devika Menon", status: "registration_pending", token: "acm-ananya-3gh7",
    createdAt: day(-1),
    history: hist([[-1, "Candidate created by Priya Deshmukh", "create"], [-1, "Onboarding link sent via email", "info"]]),
  });

  const ishita = cand({
    companyId: acme, name: "Ishita Nair", email: "ishita.nair@gmail.com", phone: "9899887766",
    position: "Business Analyst", department: "Strategy", joiningDate: day(20).slice(0, 10),
    salary: 1300000, reportingManager: "Amit Deshpande", status: "rejected", token: "acm-ishita-6jk9",
    createdAt: day(-19), submittedAt: day(-10), agreed: true,
    ...fullForms("Ishita Nair", "ishita.nair@gmail.com", "9899887766", "Female", "Deloitte", "4 years"),
    docs: docs(true),
    history: hist([[-19, "Candidate created by Priya Deshmukh", "create"], [-19, "Onboarding link sent via email", "info"], [-10, "Onboarding information submitted", "success"], [-6, "HR review completed — forwarded for approval", "info"], [-5, "Rejected by Arjun Malhotra — headcount freeze for Q2", "danger"]]),
  });

  return {
    v: SEED_VERSION,
    companies: [
      {
        id: acme, name: "Acme Technologies", website: "acmetech.io", address: "4th Floor, Meridian Tower, HSR Layout, Bengaluru 560102",
        contactEmail: "people@acmetech.io", contactPhone: "+91 80 4712 9900", logoColor: "#2b4ed6", plan: "business", trial: false, active: true, createdAt: day(-240),
        settings: { hrName: "Priya Deshmukh", hrDesignation: "Head of People", offerSubject: "Congratulations! Your Offer from {{CompanyName}}", terms: DEFAULT_TERMS, senderName: "Acme People Team", senderEmail: "people@acmetech.io" },
      },
      {
        id: nova, name: "Nova Solutions", website: "novasolutions.co", address: "91 Springboard, Koramangala, Bengaluru",
        contactEmail: "hr@novasolutions.co", contactPhone: "+91 80 2210 4455", logoColor: "#0d9488", plan: "starter", trial: true, active: true, createdAt: day(-21),
        settings: { hrName: "Daniel Fernandes", hrDesignation: "HR Lead", offerSubject: "Congratulations! Your Offer from {{CompanyName}}", terms: DEFAULT_TERMS.slice(0, 5), senderName: "Nova HR", senderEmail: "hr@novasolutions.co" },
      },
      {
        id: bright, name: "BrightLabs", website: "brightlabs.dev", address: "WeWork Galaxy, Residency Road, Bengaluru",
        contactEmail: "people@brightlabs.dev", contactPhone: "+91 80 4123 7788", logoColor: "#b45309", plan: "enterprise", trial: false, active: true, createdAt: day(-400),
        settings: { hrName: "Sara Khan", hrDesignation: "People Ops Manager", offerSubject: "Congratulations! Your Offer from {{CompanyName}}", terms: DEFAULT_TERMS, senderName: "BrightLabs People", senderEmail: "people@brightlabs.dev" },
      },
    ],
    users: [
      { id: "u_root", companyId: null, name: "Alisha Verma", email: "admin@offerflow.ai", role: "platform_admin", password: "offerflow", verified: true, color: "#101a40", createdAt: day(-500) },
      { id: "u_priya", companyId: acme, name: "Priya Deshmukh", email: "hr@acme.demo", role: "hr", password: "demo1234", verified: true, color: "#2b4ed6", createdAt: day(-220) },
      { id: "u_arjun", companyId: acme, name: "Arjun Malhotra", email: "manager@acme.demo", role: "hr_manager", password: "demo1234", verified: true, color: "#7c3aed", createdAt: day(-220) },
      { id: "u_kavita", companyId: acme, name: "Kavita Nair", email: "admin@acme.demo", role: "company_admin", password: "demo1234", verified: true, color: "#0f766e", createdAt: day(-240) },
      { id: "u_daniel", companyId: nova, name: "Daniel Fernandes", email: "admin@nova.demo", role: "company_admin", password: "demo1234", verified: true, color: "#0d9488", createdAt: day(-21) },
      { id: "u_sara", companyId: bright, name: "Sara Khan", email: "admin@brightlabs.demo", role: "company_admin", password: "demo1234", verified: true, color: "#b45309", createdAt: day(-400) },
    ],
    candidates: [aarav, diya, ishaan, rohan, sneha, kabir, vikram, ananya, ishita,
      cand({ companyId: nova, name: "Farhan Ali", email: "farhan.ali@gmail.com", phone: "9812340011", position: "Sales Executive", department: "Sales", joiningDate: day(28).slice(0, 10), salary: 750000, reportingManager: "Daniel Fernandes", status: "hr_review", token: "nva-farhan-1aa1", createdAt: day(-9), submittedAt: day(-1), agreed: true, ...fullForms("Farhan Ali", "farhan.ali@gmail.com", "9812340011", "Male", "Byju's", "3 years"), docs: docs(true), history: hist([[-9, "Candidate created", "create"], [-1, "Onboarding information submitted", "success"]]) }),
      cand({ companyId: nova, name: "Meera Joshi", email: "meera.joshi@gmail.com", phone: "9877661122", position: "Accountant", department: "Finance", joiningDate: day(33).slice(0, 10), salary: 680000, reportingManager: "Daniel Fernandes", status: "registration_pending", token: "nva-meera-2bb2", createdAt: day(-2), history: hist([[-2, "Candidate created", "create"], [-2, "Onboarding link sent via email", "info"]]) }),
      cand({ companyId: bright, name: "Aditya Rane", email: "aditya.rane@gmail.com", phone: "9900990099", position: "ML Engineer", department: "AI Research", joiningDate: day(26).slice(0, 10), salary: 2600000, reportingManager: "Sara Khan", status: "offer_sent", token: "brt-aditya-3cc3", createdAt: day(-17), submittedAt: day(-6), agreed: true, ...fullForms("Aditya Rane", "aditya.rane@gmail.com", "9900990099", "Male", "Google", "6 years"), docs: docs(true), offer: { id: "of_b1", number: "OF-2026-042", generatedAt: day(-1), sentAt: day(-1, 14), status: "sent" }, history: hist([[-17, "Candidate created", "create"], [-6, "Onboarding information submitted", "success"], [-1, "Offer generated & emailed", "success"]]) }),
      cand({ companyId: bright, name: "Zoya Sheikh", email: "zoya.sheikh@gmail.com", phone: "9811002211", position: "Platform Engineer", department: "Engineering", joiningDate: day(15).slice(0, 10), salary: 2400000, reportingManager: "Sara Khan", status: "accepted", token: "brt-zoya-4dd4", createdAt: day(-30), submittedAt: day(-20), agreed: true, ...fullForms("Zoya Sheikh", "zoya.sheikh@gmail.com", "9811002211", "Female", "Amazon", "5 years"), docs: docs(true), offer: { id: "of_b2", number: "OF-2026-038", generatedAt: day(-16), sentAt: day(-16, 11), viewedAt: day(-15), respondedAt: day(-14), status: "accepted" }, history: hist([[-30, "Candidate created", "create"], [-20, "Onboarding information submitted", "success"], [-16, "Offer generated & emailed", "success"], [-14, "Offer accepted", "success"]]) }),
    ],
    notifications: [
      { id: uid(), companyId: acme, audience: "hr", candidateId: sneha.id, title: "Onboarding submitted", body: "Sneha Iyer submitted her information and 8 documents. HR review is pending.", at: day(0, 9), read: false, kind: "info" },
      { id: uid(), companyId: acme, audience: "hr", candidateId: ishaan.id, title: "Offer viewed", body: "Ishaan Kulkarni opened his offer letter — awaiting response.", at: day(-1, 18), read: false, kind: "info" },
      { id: uid(), companyId: acme, audience: "hr_manager", candidateId: rohan.id, title: "Approval required", body: "Rohan Verma (DevOps Engineer) is waiting for your approval.", at: day(-1, 11), read: false, kind: "warning" },
      { id: uid(), companyId: acme, audience: "hr_manager", title: "Offer accepted", body: "Aarav Mehta accepted offer OF-2026-011.", at: day(-7, 12), read: true, kind: "success" },
      { id: uid(), companyId: acme, audience: "company_admin", title: "Trial reminder", body: "Your workspace is on the Business plan. 2 seats in use.", at: day(-2, 9), read: true, kind: "info" },
      { id: uid(), companyId: acme, audience: "candidate", candidateId: diya.id, title: "Offer letter released", body: "Your offer from Acme Technologies is ready. Open your portal to view it.", at: day(-2, 16), read: false, kind: "success" },
      { id: uid(), companyId: acme, audience: "candidate", candidateId: vikram.id, title: "Changes requested", body: "HR requested a re-upload of your PAN Card. Open your portal to update.", at: day(-1, 13), read: false, kind: "warning" },
      { id: uid(), companyId: acme, audience: "candidate", candidateId: kabir.id, title: "Welcome to OfferFlow", body: "Complete your onboarding information and upload the required documents.", at: day(-6, 10), read: true, kind: "info" },
    ],
    emails: [
      { id: uid(), companyId: acme, to: diya.email, toName: "Diya Sharma", subject: "Congratulations! Your Offer from Acme Technologies", body: "Dear Diya Sharma,\n\nCongratulations! We are pleased to offer you the position of Product Designer at Acme Technologies.\n\nPlease find your offer letter attached.\n\nWarm regards,\nPriya Deshmukh\nHead of People, Acme Technologies", at: day(-2, 16), type: "offer" },
      { id: uid(), companyId: acme, to: ishaan.email, toName: "Ishaan Kulkarni", subject: "Congratulations! Your Offer from Acme Technologies", body: "Dear Ishaan Kulkarni,\n\nCongratulations! We are pleased to offer you the position of Backend Engineer at Acme Technologies.\n\nPlease find your offer letter attached.", at: day(-3, 12), type: "offer" },
      { id: uid(), companyId: acme, to: vikram.email, toName: "Vikram Patel", subject: "Action needed: update your onboarding details — Acme Technologies", body: "Dear Vikram Patel,\n\nOur HR team reviewed your submission and needs a small update: your PAN Card scan is not readable. Please open your secure portal and re-upload it.", at: day(-1, 13), type: "changes_requested" },
      { id: uid(), companyId: acme, to: ananya.email, toName: "Ananya Rao", subject: "Welcome aboard! Complete your onboarding — Acme Technologies", body: "Dear Ananya Rao,\n\nCongratulations on being selected! Click the secure link below to complete your onboarding information and upload your documents.", at: day(-1, 10), type: "onboarding_invite" },
      { id: uid(), companyId: acme, to: "kabir.singh@gmail.com", toName: "Kabir Singh", subject: "Welcome aboard! Complete your onboarding — Acme Technologies", body: "Dear Kabir Singh,\n\nCongratulations on being selected! Click the secure link below to complete your onboarding.", at: day(-6, 10), type: "onboarding_invite" },
    ],
    audits: [
      { id: uid(), companyId: acme, actor: "Priya Deshmukh", action: "candidate.create", detail: "Created candidate Ananya Rao (Marketing Associate)", at: day(-1, 10) },
      { id: uid(), companyId: acme, actor: "System", action: "offer.generate", detail: "Offer OF-2026-014 generated for Diya Sharma", at: day(-2, 16) },
      { id: uid(), companyId: acme, actor: "Arjun Malhotra", action: "approval.grant", detail: "Approved Diya Sharma for offer generation", at: day(-2, 15) },
      { id: uid(), companyId: acme, actor: "Priya Deshmukh", action: "review.request_changes", detail: "Requested PAN Card re-upload from Vikram Patel", at: day(-1, 13) },
      { id: uid(), companyId: acme, actor: "Arjun Malhotra", action: "approval.reject", detail: "Rejected Ishita Nair — headcount freeze for Q2", at: day(-5, 15) },
      { id: uid(), companyId: acme, actor: "System", action: "email.send", detail: "Offer email sent to aarav.mehta@gmail.com", at: day(-9, 15) },
    ],
    templates: [
      { id: "t1", companyId: acme, key: "onboarding_invite", name: "Onboarding Invite", description: "Sent when HR creates a candidate and shares the secure link.", subject: "Welcome aboard! Complete your onboarding — {{CompanyName}}", body: "Dear {{CandidateName}},\n\nCongratulations on being selected for {{Position}}! Click the secure link below to complete your onboarding information and upload your documents.\n\n{{PortalLink}}\n\nWarm regards,\n{{HRName}}" },
      { id: "t2", companyId: acme, key: "changes_requested", name: "Changes Requested", description: "Sent when HR requests corrections to a submission.", subject: "Action needed: update your onboarding details — {{CompanyName}}", body: "Dear {{CandidateName}},\n\nOur HR team reviewed your submission and needs a small update: {{ChangeNote}}\n\nOpen your secure portal to make the changes.\n\nRegards,\n{{HRName}}" },
      { id: "t3", companyId: acme, key: "offer_released", name: "Offer Released", description: "Sent automatically after the HR Manager approves.", subject: "Congratulations! Your Offer from {{CompanyName}}", body: "Dear {{CandidateName}},\n\nCongratulations! We are pleased to offer you the position of {{Position}} at {{CompanyName}}.\n\nPlease find your offer letter attached.\n\nWarm regards,\n{{HRName}}\n{{HRDesignation}}" },
      { id: "t4", companyId: acme, key: "user_invite", name: "Team Member Invite", description: "Sent when a company admin invites an HR user.", subject: "You've been invited to {{CompanyName}} on OfferFlow AI", body: "Hi,\n\nYou've been invited to join {{CompanyName}} on OfferFlow AI. Sign in with the temporary password shared by your admin to get started." },
    ],
    birthdays: [
      { id: "b1", companyId: acme, name: "Ritika Chandra", designation: "Design Lead", department: "Design", monthDay: "03-14", color: "#e11d48" },
      { id: "b2", companyId: acme, name: "Nikhil Bansal", designation: "Engineering Manager", department: "Engineering", monthDay: "07-09", color: "#2b4ed6" },
      { id: "b3", companyId: acme, name: "Farida Khan", designation: "Support Manager", department: "Support", monthDay: "09-02", color: "#0d9488" },
      { id: "b4", companyId: acme, name: "Amit Deshpande", designation: "Analytics Lead", department: "Analytics", monthDay: "11-21", color: "#b45309" },
      { id: "b5", companyId: acme, name: "Devika Menon", designation: "Marketing Manager", department: "Marketing", monthDay: "12-30", color: "#7c3aed" },
      { id: "b6", companyId: acme, name: "Sameer Kulkarni", designation: "Infra Lead", department: "Infrastructure", monthDay: "01-28", color: "#0369a1" },
    ],
    festivals: [
      { id: "f1", name: "Pongal", monthDay: "01-14", desc: "Harvest festival — office lunch & traditional dress day.", hue: 30 },
      { id: "f2", name: "Republic Day", monthDay: "01-26", desc: "National holiday. Flag hoisting at 9 AM, main campus.", hue: 210 },
      { id: "f3", name: "Holi", monthDay: "03-03", desc: "Festival of colours — terrace celebration with gujiya & thandai.", hue: 330 },
      { id: "f4", name: "Eid al-Fitr", monthDay: "03-21", desc: "Celebrated with a team feast and sweet exchange.", hue: 160 },
      { id: "f5", name: "Independence Day", monthDay: "08-15", desc: "National holiday — kite flying on the terrace.", hue: 25 },
      { id: "f6", name: "Acme Foundation Day", monthDay: "09-18", desc: "Company anniversary — townhall, awards & cake.", hue: 250 },
      { id: "f7", name: "Diwali", monthDay: "11-08", desc: "Festival of lights — office decoration contest & gift hampers.", hue: 45 },
      { id: "f8", name: "Christmas", monthDay: "12-25", desc: "Secret Santa exchange & year-end celebration.", hue: 350 },
      { id: "f9", name: "New Year", monthDay: "01-01", desc: "Fresh starts — goals workshop & team brunch.", hue: 190 },
    ],
  };
}
