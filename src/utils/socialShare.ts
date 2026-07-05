import { SocialProvider } from "./enums/SocialProvider";
import { EventCategory } from "./enums/EventCategory";
import Milestone from "./classes/Milestone";
import { Temporal } from "@js-temporal/polyfill";
import { ATTRIBUTION_URL } from "./constants";

/**
 * Generate share URL or text for the specified social provider
 * For Copy provider, returns the share text directly (not a URL)
 * 
 * Platform limitations:
 * - Facebook: Basic sharer only shares URL (custom text requires FB App integration)
 * - LinkedIn: Only shares URL (no custom text in public share API)
 * - Messenger: Link-only sharing via deep link
 * - Twitter, WhatsApp, SMS: Full text support ✓
 */
export function generateShareUrl(
  milestone: Milestone,
  label: string,
  provider: SocialProvider,
  originalDate: Temporal.PlainDate | Temporal.PlainDateTime | null,
  locale: string
): string {
  // Build share text
  const formattedOriginalDate = originalDate ? originalDate.toLocaleString(locale) : "";

  // Determine the context phrase based on milestone category
  let contextPhrase: string;

  switch (milestone.category) {
    case EventCategory.Today:
      contextPhrase = "Today's exactly";
      break;
    case EventCategory.ThisWeek:
    case EventCategory.NextWeek:
    case EventCategory.ThisMonth:
    case EventCategory.NextMonth:
    case EventCategory.ThisYear:
    case EventCategory.NextYear:
    case EventCategory.Further:
    case EventCategory.BeyondHumanLifeExpectancy:
      // Use the milestone's actual date for future events
      contextPhrase = `On ${milestone.dateString}, it will be exactly`;
      break;
    case EventCategory.AlreadyPassed:
      // Use the milestone's actual date for past events
      contextPhrase = `On ${milestone.dateString}, it was exactly`;
      break;
    default:
      contextPhrase = "Today's exactly";
  }

  const shareText = `${contextPhrase} ${milestone.label} since ${label.trim()} (${formattedOriginalDate}) - Calculated with Jublio at ${ATTRIBUTION_URL}`;

  // Encode for URL usage
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(ATTRIBUTION_URL);

  // Generate provider-specific URL or return text
  switch (provider) {
    case SocialProvider.Facebook:
      // Facebook sharer.php - only shares URL (quote parameter not supported)
      // To include custom text, would need Facebook App ID and SDK integration
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

    case SocialProvider.Messenger:
      // Messenger share - link only
      return `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=&redirect_uri=${encodedUrl}`;

    case SocialProvider.WhatsApp:
      // WhatsApp - full text support
      return `https://wa.me/?text=${encodedText}`;

    case SocialProvider.Twitter:
      // Twitter/X - full text support
      return `https://twitter.com/intent/tweet?text=${encodedText}`;

    case SocialProvider.LinkedIn:
      // LinkedIn - URL only (summary not supported in public API)
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

    case SocialProvider.SMS:
      // SMS - full text support (works on mobile devices)
      return `sms:?&body=${encodedText}`;

    case SocialProvider.Copy:
      // Return the share text directly (no URL)
      return shareText;

    default:
      throw new Error(`Unsupported social provider: ${provider}`);
  }
}
