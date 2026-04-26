import { createUnavailableProxy, hyperlaneUnavailable } from './shared';

export const assert = () => hyperlaneUnavailable('Hyperlane utils');
export const protocolToString = () => hyperlaneUnavailable('Hyperlane utils');

export default createUnavailableProxy('Hyperlane utils');
export { hyperlaneUnavailable };
