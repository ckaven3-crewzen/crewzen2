/*
 * AccessZen Module Route Page
 * 
 * PURPOSE: Main route entry point for AccessZen module
 * 
 * ✅ COMPONENT STATUS: SIMPLE ROUTE WRAPPER - Clean delegation pattern
 * - Route: /accesszen
 * - Function: Delegate to AccessZenPage component
 * - Integration: Bridge between Next.js routing and AccessZenPage component
 * 
 * 🔍 USAGE ANALYSIS:
 * - Main entry point for AccessZen module
 * - No duplicates found - unique route wrapper
 * - Follows consistent pattern with other modules (ProZen uses same pattern)
 * - Clean separation between routing and business logic
 * 
 * ✅ EXCELLENT ROUTE PATTERN:
 * - **Minimal Responsibility**: Only handles route delegation
 * - **Clean Architecture**: Separates routing from component logic
 * - **Consistent Pattern**: Matches other module route wrappers
 * - **Import Efficiency**: Simple component import and delegation
 * 
 * 🏗️ ARCHITECTURE BENEFITS:
 * - Next.js App Router pattern compliance
 * - Component composition over route complexity
 * - Business logic isolated in AccessZenPage component
 * - Easy to maintain and understand
 * 
 * 📝 MODULE CONTEXT:
 * - Part of AccessZen estate management module
 * - Connects to AccessZenPage for estate dashboard functionality
 * - Supports dynamic estate detail routes via [estateId]/page.tsx
 * 
 * 🏷️ RECOMMENDATION: KEEP - Perfect route wrapper pattern, no changes needed
 */

import AccessZenPage from './components/AccessZenPage';

export default function AccessZen() {
  return <AccessZenPage />;
} 