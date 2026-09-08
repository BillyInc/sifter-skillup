export const MediaTypeOptions = { Images: "images", Videos: "videos", All: "all" } as const;
export async function requestMediaLibraryPermissionsAsync() { return { granted: false, status: "denied" }; }
export async function launchImageLibraryAsync() { return { canceled: true, assets: [] }; }
export async function launchCameraAsync() { return { canceled: true, assets: [] }; }

