/**
 * @fileoverview
 * This file contains all the core TypeScript types and interfaces used across the application.
 * It serves as a single source of truth for the data structures,
 * making it easier to maintain and ensuring consistency between the frontend and backend.
 * These types would ideally be shared in a monorepo or generated from a backend schema (e.g., using Prisma or a GraphQL schema).
 */

// Importing LucideIcon type for type-safe icon usage in components like Category lists.
import type { LucideIcon } from "lucide-react";

// DEV_COMMENT: Represents a single geographic point for pickup or drop-off.
// Used within the Trip interface to define logistics.
export interface Point {
    label: string; // e.g., "Delhi ISBT" or "Manali Bus Stand"
    time: string; // e.g., "06:00 AM"
    mapsLink: string; // URL to Google Maps for easy navigation.
}

/**
 * @interface TripBatch
 * @description Represents a specific scheduled departure for a trip.
 * A single trip can have multiple batches, allowing organizers to offer the same tour on different dates,
 * potentially with different pricing or capacity.
 */
export interface TripBatch {
  id: string;
  startDate: string; // ISO 8601 format: "YYYY-MM-DD"
  endDate: string; // ISO 8601 format: "YYYY-MM-DD"
  bookingCutoffDate?: string; // Optional: The last date a user can book this batch.
  maxParticipants: number;
  priceOverride?: number; // Optional: If set, this price is used for this batch instead of the trip's default price. Useful for peak season pricing.
  status: 'Active' | 'Inactive' | 'Pending Approval' | 'Rejected'; // Batch-level status, managed by the admin/organizer.
  notes?: string; // Internal or public notes, e.g., "Festival Special Batch".
  availableSlots: number; // This would be dynamically calculated on the backend (maxParticipants - currentBookings). The frontend receives this as a read-only value.
}

/**
 * @interface CancellationRule
 * @description Defines a single rule for the trip's cancellation policy. An array of these rules creates a tiered policy.
 * e.g., { days: 30, refundPercentage: 100 } means 100% refund if cancelled 30 days or more before the trip.
 */
export interface CancellationRule {
  days: number; // The number of days before departure this rule applies to.
  refundPercentage: number; // The percentage of the booking amount to be refunded (0-100).
}

/**
 * @interface FAQ
 * @description Represents a single Frequently Asked Question for a trip.
 */
export interface FAQ {
    question: string;
    answer: string;
}

/**
 * @interface ItineraryItem
 * @description Represents one day in the trip's itinerary.
 */
export interface ItineraryItem {
    day: number;
    title: string;
    description: string;
    image?: string; // Optional image URL for the day's activities.
    imageHint?: string; // AI hint for placeholder if image is not available.
}

/**
 * @interface TripChangeLog
 * @description Represents a single entry in the trip's change log, creating an audit trail of modifications.
 * BACKEND_NOTE: This should be its own collection/table (e.g., `tripChangeLogs`) linked to the trip.
 */
export interface TripChangeLog {
  id: string;
  timestamp: string; // ISO 8601 format of when the change was made.
  changedBy: string; // Could be the organizer's name or the admin's name.
  section: 'Trip' | 'Batch' | 'Pricing' | 'Policy'; // The part of the trip that was modified.
  changeType: 'Created' | 'Edited' | 'Deleted' | 'Status Change';
  remarks: string; // A mandatory, human-readable reason for the change.
  changedFields: string; // A summary of the actual change, e.g., "Price: ₹12,500 → ₹14,000".
}

/**
 * @interface SpotReservationDetails
 * @description Contains all settings related to the partial payment / spot reservation feature for a trip.
 * This feature allows users to book a spot by paying a small advance amount.
 */
export interface SpotReservationDetails {
  advanceAmount: number; // The amount to be paid upfront.
  finalPaymentDueDate: number; // The deadline for paying the remaining balance, in days before the trip starts.
  commissionPercentage: number; // A special commission rate on the advance amount if the user forfeits it.
  description: string; // User-facing text explaining the terms, shown in the booking modal.
  termsAndConditions?: string; // Detailed T&Cs for the spot reservation (e.g., non-refundable policy).
}

/**
 * @interface Trip
 * @description The main data structure for a travel package. This is a comprehensive object that contains all
 * information an organizer provides and that an admin manages.
 */
export interface Trip {
  id: string;
  slug: string; // URL-friendly version of the title, generated on creation.
  title: string;
  listingModel?: 'Commission' | 'Leads'; // The monetization model for this trip.
  location: string; // General display location, e.g., "Himalayas, India".
  city: string; // Specific destination city used for filtering, e.g., "Manali".
  tripType: string; // The primary category of the trip, e.g., "Trek", "Adventure". Corresponds to a Category name.
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Challenging';
  duration: string; // User-facing text, e.g., "3 Days, 2 Nights".
  description: string;
  minAge: number;
  maxAge: number;
  pickupCity: string; // A single city context for all pickup/drop-off points, e.g., "Delhi".
  pickupPoints: Point[];
  dropoffPoints: Point[];
  interests?: string[]; // Searchable tags like "Hiking", "Photography", used for filtering.

  category: string; // DEPRECATED: Retained for mock data compatibility, but `tripType` is the primary classification.
  isFeaturedRequest: boolean; // A flag the organizer can set to request their trip be featured.
  
  // --- Pricing & Spot Reservation ---
  price: number; // Default base price per person, defined by the organizer.
  taxIncluded: boolean; // Flag to indicate if the base price includes tax.
  taxPercentage?: number; // Tax percentage to be applied if not included.
  spotReservationEnabled?: boolean; // Organizer can toggle this feature on/off.
  spotReservationDetails?: SpotReservationDetails;
  
  // --- Visuals ---
  image: string; // URL for the main cover image.
  imageHint: string; // AI hint for placeholder image generation.
  gallery: { url: string; hint: string }[];

  // --- Details ---
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryItem[];
  
  // --- Batches & Policies ---
  batches: TripBatch[];
  cancellationPolicy: string; // A user-facing summary text of the cancellation policy.
  cancellationRules: CancellationRule[]; // Structured rules used for automated refund calculations.
  faqs: FAQ[];

  // --- Metadata & Status ---
  reviews: { id: string; userId: string; rating: number; comment: string }[];
  organizerId: string; // Foreign key linking to the Organizer.
  isFeatured: boolean; // A flag set by a Superadmin to feature the trip on the homepage.
  isBannerTrip?: boolean; // A flag set by a Superadmin to add the trip to the homepage banner carousel.
  status: 'Published' | 'Draft' | 'Unlisted' | 'Pending Approval' | 'Rejected'; // The overall status of the trip listing.
  adminNotes?: string; // Internal notes from an admin, often used for rejection reasons.
  changeLogs?: TripChangeLog[]; // An audit trail of all significant changes to the trip.
}

/**
 * @interface OrganizerDocument
 * @description Represents a single document uploaded by an organizer for KYC (Know Your Customer) verification.
 */
export interface OrganizerDocument {
  docType: string; // A unique identifier for the document type, e.g., 'pan_card'.
  docTitle: string; // A user-friendly title for the document, e.g., "Identity Document (PAN/Aadhar)".
  fileUrl?: string; // URL to the uploaded file on a secure server (e.g., S3/Cloudinary).
  uploadedAt?: string; // ISO 8601 format date of when the document was uploaded.
  status: 'Pending' | 'Uploaded' | 'Verified' | 'Rejected'; // The verification status of the document. 'Pending' is the initial state.
  rejectionReason?: string; // Optional feedback from an admin if the document is rejected.
}

// Represents a credit package purchase transaction by an organizer.
export interface LeadPurchase {
  id: string;
  packageId: string;
  packageName: string;
  creditsPurchased: number;
  price: number;
  paymentRef?: string;
  createdAt: string; // ISO 8601 format
}

// Represents the consumption of a credit by an organizer to unlock a lead's contact details.
export interface LeadUnlock {
  id: string;
  leadId: string;
  leadName: string; // Denormalized for easy display in history.
  tripTitle: string; // Denormalized for context.
  cost: number; // Usually 1 credit.
  createdAt: string; // ISO 8601 format
}


/**
 * @interface Organizer
 * @description Represents a trip organizer or vendor on the platform.
 * Contains both public-facing info and internal verification data.
 */
export interface Organizer {
  id: string;
  name: string; // Business / Brand Name
  email: string; // Primary contact email for platform communication
  joinDate: string;

  // --- Public Profile Information ---
  organizerType?: 'Individual' | 'Sole Proprietorship' | 'Private Limited' | 'LLP' | 'Other' | 'Hotel' | 'Restaurant' | 'Activity' | 'Rental';
  logo?: string; // URL for the brand logo
  phone?: string;
  address?: string; // Full registered business address
  website?: string; // Optional, public website URL
  experience?: number; // Years of experience in the industry
  specializations?: string[]; // e.g., ['Trekking', 'Wildlife', 'Adventure']
  isProfileComplete: boolean; // A flag set on the backend after all required profile fields are filled.
  
  // --- Agreement & Emergency Contact Fields (for legal and operational purposes) ---
  authorizedSignatoryName?: string;
  authorizedSignatoryId?: string; // e.g., PAN or Aadhaar
  emergencyContact?: string;
  
  // --- Financial Information (for payouts, viewable by admins) ---
  pan?: string;
  gstin?: string;
  bankAccountNumber?: string;
  ifscCode?: string;

  // --- Verification & Status ---
  kycStatus: 'Incomplete' | 'Pending' | 'Verified' | 'Rejected' | 'Suspended';
  documents: OrganizerDocument[];
  vendorAgreementStatus: 'Not Submitted' | 'Submitted' | 'Verified' | 'Rejected';

  // --- Lead Model Specific Fields ---
  leadCredits: {
      available: number;
      planName: string;
  };
  leadPurchaseHistory: LeadPurchase[];
  leadUnlockHistory: LeadUnlock[];
}


/**
 * @interface WalletTransaction
 * @description Represents a single transaction in a user's wallet (e.g., credit from a referral, debit for a booking).
 */
export interface WalletTransaction {
  id: string;
  date: string; // ISO 8601 format
  description: string; // e.g., "Referral Bonus", "Used for Booking BK123"
  amount: number; // Can be positive (credit) or negative (debit).
  type: 'Credit' | 'Debit';
  source: 'Referral' | 'Booking' | 'Refund' | 'Admin Adjustment' | 'Promo';
}

/**
 * @interface User
 * @description Represents a regular user (traveler) on the platform.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  status: 'Active' | 'Suspended';
  isProfileComplete: boolean; // Backend should set this to true only after all required fields are filled.

  // --- Optional Profile Details ---
  walletBalance: number;
  referralCode: string; // The user's OWN unique code to share with others.
  referredBy: string | null; // The ID of the user who referred this user, if any.
  avatar: string;
  gender?: 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say';
  dateOfBirth?: string; // ISO string: "YYYY-MM-DD"
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Prefer not to say';
  emergencyContact?: string;
  address?: {
      street: string;
      city: string;
      pincode: string;
  };
  interests?: string[];
  travelPreferences?: 'Budget' | 'Mid-range' | 'Luxury';
  marketingOptIn?: boolean;
  walletTransactions?: WalletTransaction[];
}

// Represents a single traveler in a booking. A booking can have multiple travelers.
export interface Traveler {
    name: string;
    email: string;
    phone: string;
    emergencyName?: string;
    emergencyPhone?: string;
}

/**
 * @interface Booking
 * @description Represents a single booking made by a user for a specific trip batch.
 * This would be a primary collection/table in the database.
 */
export interface Booking {
  id:string;
  tripId: string;
  userId: string;
  batchId: string;
  bookingDate: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled' | 'Pending Confirmation';
  refundStatus?: 'Pending' | 'Processed' | 'None';
  
  // --- Financial Breakdown (must be calculated and stored on the backend) ---
  subtotal: number;
  couponCodeUsed?: string | null;
  couponDiscount?: number;
  walletAmountUsed?: number;
  taxAmount?: number;
  amount: number; // The final amount paid by the user (can be the full price or the advance amount).
  paymentMode?: 'Card' | 'UPI' | 'Netbanking' | 'Wallet';
  transactionId?: string;
  
  // --- Spot Reservation Fields ---
  isPartialBooking?: boolean; // True if this was a spot reservation.
  advancePaid?: number;
  remainingAmount?: number;
  finalPaymentDueDate?: string; // ISO Date "YYYY-MM-DD"
  paymentStatus?: 'PARTIAL' | 'FULL' | 'EXPIRED'; // Tracks the payment state of the booking.

  reviewLeft: boolean; // Flag to check if the user has already left a review for this booking.
  travelers: Traveler[];
  cancellationReason?: string; // User-provided reason for cancellation.
}

/**
 * @interface City
 * @description Represents a city that can be used for trip destinations or pickups. Managed by the Superadmin.
 */
export interface City {
    id: string;
    name: string;
    enabled: boolean; // If false, the city cannot be selected in forms or filters.
}

/**
 * @interface Dispute
 * @description Represents a dispute raised by a user against a booking, for admin mediation.
 */
export interface Dispute {
    id: string;
    bookingId: string;
    userId: string;
    organizerId: string;
    reason: string;
    status: 'Open' | 'Resolved' | 'Closed';
    dateReported: string;
}

/**
 * @interface Payout
 * @description Represents a payout record for a trip organizer's earnings.
 * Generated after a trip batch is completed and revenue is calculated.
 */
export interface Payout {
  id: string;
  tripId: string;
  batchId: string;
  organizerId: string;
  totalRevenue: number; // Gross revenue from bookings for this batch.
  platformCommission: number; // The commission amount retained by Travonex.
  netPayout: number; // The final amount to be paid to the organizer.
  status: 'Pending' | 'Paid' | 'Failed';
  requestDate: string; // When the organizer requested the payout.
  paidDate?: string | Date; // When the payout was processed by the admin.
  paymentMode?: 'IMPS' | 'NEFT' | 'UPI' | 'Manual';
  utrNumber?: string; // Unique Transaction Reference from the bank.
  invoiceUrl?: string; // Link to the generated invoice PDF.
  notes?: string; // Internal notes from the admin.
}

/**
 * @interface PromoCode
 * @description Represents a promotional code created by an admin or an organizer.
 */
export interface PromoCode {
  id: string;
  code: string;
  type: 'Fixed' | 'Percentage'; // Fixed amount discount or percentage-based.
  value: number;
  usage: number; // How many times the code has been used.
  limit: number; // The maximum number of times the code can be used.
  status: 'Active' | 'Inactive' | 'Expired';
  expiryDate: string; // ISO 8601 format: "YYYY-MM-DD"
  createdBy?: 'Admin' | string; // Can be 'Admin' or an organizer's ID.
}

/**
 * @interface HomeBanner
 * @description Represents a single banner in the homepage carousel, managed by admins.
 */
export interface HomeBanner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string; // Can be an internal path (e.g., /trips/some-slug) or an external URL.
  isActive: boolean;
}

/**
 * @interface AdminNotification
 * @description Represents a system-level notification for admins (e.g., new KYC submission).
 */
export interface AdminNotification {
  id: string;
  type: 'KYC' | 'Trip' | 'Payout' | 'User' | 'Dispute';
  title: string;
  description: string;
  timestamp: string; // ISO 8601 format
  isRead: boolean;
  link?: string; // Optional deep link to the relevant admin page.
  icon: LucideIcon;
  iconColor: string;
}

/**
 * @interface AuditLog
 * @description Represents a single entry in the admin audit log for tracking important actions.
 */
export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: 'Create' | 'Update' | 'Delete' | 'Login' | 'Approve' | 'Reject' | 'Process' | 'Suspend';
  module: string; // e.g., 'Trips', 'Organisers', 'Payouts'
  details: string; // e.g., "Updated trip 'Goa Getaway' (ID: 1)"
  timestamp: string; // ISO 8601 format
}

/**
 * @interface AdminUser
 * @description Represents an administrative user with specific roles and permissions.
 */
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Finance Manager' | 'Support Agent' | 'Operations Manager';
  status: 'Active' | 'Inactive' | 'Suspended';
  lastLogin: string; // ISO 8601 format
}


// Represents a trip category, managed by the admin.
export interface Category {
  id: string;
  name: string;
  icon: LucideIcon; // The LucideIcon component to be rendered.
  status: 'Active' | 'Inactive';
}

// Represents a trip interest tag, managed by the admin, used for filtering.
export interface Interest {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
}

/**
 * @interface SessionUser
 * @description Represents the lean data structure stored in the user's session cookie.
 * Contains only the essential info needed for authentication checks and displaying user info in the header.
 */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string; // e.g., 'USER', 'ORGANIZER', 'Super Admin'
  avatar: string;
}

/**
 * @interface Lead
 * @description Represents a potential customer lead generated from the "Need Assistance" form.
 * The contact details are initially masked and are "unlocked" by the organizer using credits.
 */
export interface Lead {
  id: string;
  tripId: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
  date: string; // ISO 8601 format
  isUnlocked: boolean; // Controls visibility of contact details for the organizer.
  convertedToBooking: boolean; // Flag to track lead conversion.
}

/**
 * @interface LeadPackage
 * @description Represents a lead credit package that can be purchased by organizers. Managed by admins.
 */
export interface LeadPackage {
  id: string;
  name: string;
  leadCount: number;
  price: number;
  validityDays?: number;
  bonusCredits?: number;
  status: 'Active' | 'Archived';
}

/**
 * @interface Offer
 * @description Represents a single travel-related offer from a partner advertiser (e.g., hotel, restaurant).
 */
export interface Offer {
    id: string;
    advertiserId: string; // Foreign key to the Organizer table.
    advertiserName: string; // Denormalized for display purposes.
    advertiserLogo: string; // Denormalized for display purposes.
    title: string;
    slug: string;
    description: string;
    category: 'Hotel' | 'Food' | 'Rental' | 'Activity';
    city: string;
    discountType: 'Percentage' | 'Fixed';
    discountValue: number;
    termsAndConditions: string;
    redemptionInstructions: string;
    validityStartDate: string; // ISO Date "YYYY-MM-DD"
    validityEndDate: string; // ISO Date "YYYY-MM-DD"
    status: 'Pending' | 'Active' | 'Expired' | 'Rejected';
    isSponsored: boolean; // Flag for featured placement.
    rejectionReason?: string; // Feedback from admin if rejected.
    imageUrl: string; // Cover image for the offer.
    imageHint: string;
    createdAt?: string; // ISO 8601 format
}
