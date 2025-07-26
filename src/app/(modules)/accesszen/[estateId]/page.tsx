/*
 * Estate Detail Route Page
 * 
 * PURPOSE: Dynamic route wrapper for estate detail display in AccessZen module
 * 
 * ✅ COMPONENT STATUS: SIMPLE ROUTE WRAPPER - Clean parameter handling
 * - Route: /accesszen/[estateId]
 * - Function: Extract estateId from URL params and pass to EstateDetailPage component
 * - Integration: Bridge between Next.js routing and EstateDetailPage component
 * 
 * 🔍 USAGE ANALYSIS:
 * - Single usage: URL route handling for estate details
 * - No duplicates found - unique route wrapper
 * - Delegates functionality to EstateDetailPage component
 * - Clean separation between routing and business logic
 * 
 * ✅ SIMPLE & EFFECTIVE IMPLEMENTATION:
 * - Proper parameter extraction with Array.isArray safety check
 * - Clean default value handling (empty string fallback)
 * - Minimal, focused responsibility (route parameter handling only)
 * - Good separation of concerns (routing vs display logic)
 * 
 * 🏗️ ARCHITECTURE PATTERN:
 * - Next.js App Router dynamic route pattern
 * - Component delegation pattern (route → component)
 * - Parameter normalization (array → string)
 * - Clean component composition
 * 
 * 📝 CODE QUALITY:
 * - Type-safe parameter handling
 * - Proper null/undefined checks
 * - Clean, readable implementation
 * - Good naming conventions
 * 
 * 🔗 INTEGRATION:
 * - Uses EstateDetailPage component from ../components/
 * - Part of AccessZen module architecture
 * - Connects URL routing to estate management functionality
 * 
 * 🏷️ RECOMMENDATION: KEEP - Perfect example of clean route wrapper pattern
 */

"use client";
import EstateDetailPage from '../components/EstateDetailPage';
import { useParams } from 'next/navigation';

export default function EstateDetailRoute() {
  const params = useParams();
  // Ensure estateId is always a string
  const estateId = Array.isArray(params.estateId) ? params.estateId[0] : (params.estateId ?? "");
  return <EstateDetailPage estateId={estateId} />;
}
