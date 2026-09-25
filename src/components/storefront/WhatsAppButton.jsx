import React from "react";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/201000000000?text=Hi%20Drivo%2C%20I%20have%20a%20question%20about%20your%20products"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-30 flex items-center gap-2 px-4 py-3 bg-foreground text-background shadow-lg hover:bg-accent hover:text-accent-foreground transition-colors group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="hidden sm:inline font-heading text-sm font-semibold">
        Support
      </span>
    </a>
  );
}
