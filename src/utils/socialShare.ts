import { SocialProvider } from "./enums/SocialProvider";
import Milestone from "./classes/Milestone";
import { Temporal } from "@js-temporal/polyfill";
import { ATTRIBUTION_URL } from "./constants";

/**
 * Generate share URL or text for the specified social provider
 * For Copy provider, returns the share text directly (not a URL)
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
  const shareText = `Today's ${milestone.label} since ${label.trim()} (${formattedOriginalDate}) - Calculated with Jublio at ${ATTRIBUTION_URL}`;

  // Encode for URL usage
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(ATTRIBUTION_URL);

  // Generate provider-specific URL or return text
  switch (provider) {
    case SocialProvider.Facebook:
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;

    case SocialProvider.Messenger:
      return `fb-messenger://share?link=${encodedUrl}&quote=${encodedText}`;

    case SocialProvider.WhatsApp:
      return `https://api.whatsapp.com/send?text=${encodedText}`;

    case SocialProvider.Twitter:
      return `https://twitter.com/intent/tweet?text=${encodedText}`;

    case SocialProvider.LinkedIn:
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedText}`;

    case SocialProvider.SMS:
      return `sms:?&body=${encodedText}`;

    case SocialProvider.Copy:
      // Return the share text directly (no URL)
      return shareText;

    default:
      throw new Error(`Unsupported social provider: ${provider}`);
  }
}
