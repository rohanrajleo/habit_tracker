/**
 * Returns today's date as YYYY-MM-DD in LOCAL time.
 * 
 * CRITICAL: Do NOT use `new Date().toISOString().split('T')[0]` anywhere.
 * That returns UTC date, which is WRONG for users in UTC+ timezones
 * logging habits late at night (e.g. 11 PM IST = next day in UTC).
 */
export function getLocalDate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
