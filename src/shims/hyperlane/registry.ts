import { createUnavailableProxy, hyperlaneUnavailable } from './shared';

export const getRegistry = () => hyperlaneUnavailable('Hyperlane registry');
export const registry = createUnavailableProxy('Hyperlane registry');

export default createUnavailableProxy('Hyperlane registry');
export { hyperlaneUnavailable };
