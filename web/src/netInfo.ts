export type WebNetInfoState = {
  type: "unknown";
  isConnected: boolean;
  isInternetReachable: boolean;
  details: null;
};

type Listener = (state: WebNetInfoState) => void;

function currentState(): WebNetInfoState {
  const online = typeof navigator === "undefined" || navigator.onLine !== false;
  return {
    type: "unknown",
    isConnected: online,
    isInternetReachable: online,
    details: null,
  };
}

const NetInfo = {
  fetch: async (): Promise<WebNetInfoState> => currentState(),
  addEventListener: (listener: Listener): (() => void) => {
    if (typeof window === "undefined") {
      listener(currentState());
      return () => {};
    }
    const notify = () => listener(currentState());
    window.addEventListener("online", notify);
    window.addEventListener("offline", notify);
    listener(currentState());
    return () => {
      window.removeEventListener("online", notify);
      window.removeEventListener("offline", notify);
    };
  },
};

export default NetInfo;
