import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FaTwitter, FaFacebookF, FaLinkedinIn, FaRedditAlien } from 'react-icons/fa';
import { FiMail, FiShare2 } from 'react-icons/fi';
import { MdContentCopy } from 'react-icons/md';
import { toast } from '@/hooks/use-toast';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
  hashtags?: string[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Social media share buttons component
 * Provides one-click sharing to popular social media platforms
 */
const SocialShareButtons: React.FC<SocialShareProps> = ({
  url,
  title,
  description = '',
  imageUrl = '',
  hashtags = [],
  size = 'md',
  className = '',
}) => {
  // Generate sharing URLs for different platforms
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const encodedHashtags = hashtags.join(',');

  // Generate platform-specific sharing URLs
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${encodedHashtags}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const redditUrl = `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;
  const mailUrl = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`;

  // Get button size class based on size prop
  const buttonSizeClass = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }[size];

  // Get icon size based on button size
  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24,
  }[size];

  // Copy link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: 'Link copied!',
        description: 'The link has been copied to your clipboard.',
        duration: 3000,
      });
    }).catch(() => {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy the link. Please try again.',
        variant: 'destructive',
        duration: 3000,
      });
    });
  };

  // Share using native Web Share API if available
  const useNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: description,
        url: url,
      }).catch((error) => {
        console.error('Error sharing:', error);
      });
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TooltipProvider>
        {/* Twitter */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={`${buttonSizeClass} rounded-full bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white`}
              onClick={() => window.open(twitterUrl, '_blank')}
              aria-label="Share on Twitter"
            >
              <FaTwitter size={iconSize} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share on Twitter</p>
          </TooltipContent>
        </Tooltip>

        {/* Facebook */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={`${buttonSizeClass} rounded-full bg-[#1877F2] hover:bg-[#1877F2]/90 text-white`}
              onClick={() => window.open(facebookUrl, '_blank')}
              aria-label="Share on Facebook"
            >
              <FaFacebookF size={iconSize} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share on Facebook</p>
          </TooltipContent>
        </Tooltip>

        {/* LinkedIn */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={`${buttonSizeClass} rounded-full bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white`}
              onClick={() => window.open(linkedinUrl, '_blank')}
              aria-label="Share on LinkedIn"
            >
              <FaLinkedinIn size={iconSize} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share on LinkedIn</p>
          </TooltipContent>
        </Tooltip>

        {/* Reddit */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={`${buttonSizeClass} rounded-full bg-[#FF4500] hover:bg-[#FF4500]/90 text-white`}
              onClick={() => window.open(redditUrl, '_blank')}
              aria-label="Share on Reddit"
            >
              <FaRedditAlien size={iconSize} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share on Reddit</p>
          </TooltipContent>
        </Tooltip>

        {/* Email */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={`${buttonSizeClass} rounded-full bg-gray-600 hover:bg-gray-700 text-white`}
              onClick={() => window.open(mailUrl, '_blank')}
              aria-label="Share via Email"
            >
              <FiMail size={iconSize} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share via Email</p>
          </TooltipContent>
        </Tooltip>

        {/* Copy Link */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={`${buttonSizeClass} rounded-full`}
              onClick={copyToClipboard}
              aria-label="Copy Link"
            >
              <MdContentCopy size={iconSize} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy Link</p>
          </TooltipContent>
        </Tooltip>

        {/* Native Share (if available) */}
        {navigator?.share && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={`${buttonSizeClass} rounded-full bg-primary hover:bg-primary/90 text-white`}
                onClick={useNativeShare}
                aria-label="Share"
              >
                <FiShare2 size={iconSize} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share</p>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
};

export default SocialShareButtons;