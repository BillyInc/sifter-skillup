/**
 * Legacy compatibility screen.
 *
 * Community as a standalone social surface has been retired in favor of:
 * - Guilds: group coordination, rankings, chat, and guild membership
 * - Feeds: the separate social/feed tab
 *
 * Any legacy route or import that still resolves CommunityScreen should now
 * render the Guilds experience.
 */

import GuildScreen from './GuildScreen';

export default GuildScreen;
