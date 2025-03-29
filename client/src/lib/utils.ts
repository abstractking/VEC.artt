/**
 * Utilities for the VeCollab application
 */

import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Truncates an Ethereum/VeChain address to make it more readable
 * @param address The full address
 * @param startLength Number of characters to show at the start
 * @param endLength Number of characters to show at the end
 * @returns Truncated address
 */
export function truncateAddress(
  address: string,
  startLength: number = 6,
  endLength: number = 4
): string {
  if (!address) return "";
  if (address.length <= startLength + endLength) return address;
  
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

/**
 * Format VET amount to a readable string with unit
 */
export function formatVET(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (isNaN(num)) return "0 VET";
  
  // Format with comma separators
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(num) + " VET";
}

/**
 * Format VTHO amount to a readable string with unit
 */
export function formatVTHO(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (isNaN(num)) return "0 VTHO";
  
  // Format with comma separators
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(num) + " VTHO";
}

/**
 * Checks if a string is a valid hex value with or without 0x prefix
 */
export function isValidHex(value: string): boolean {
  if (!value) return false;
  
  // Remove 0x prefix if present
  const hexValue = value.startsWith("0x") ? value.slice(2) : value;
  
  // Check if the string only contains hex characters
  return /^[0-9a-fA-F]+$/.test(hexValue);
}

/**
 * Ensure a hex string has the 0x prefix
 */
export function ensureHexPrefix(value: string): string {
  if (!value) return "0x";
  return value.startsWith("0x") ? value : `0x${value}`;
}

/**
 * Remove 0x prefix from a hex string if it exists
 */
export function removeHexPrefix(value: string): string {
  if (!value) return "";
  return value.startsWith("0x") ? value.slice(2) : value;
}