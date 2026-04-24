import LessonScreen from '@/screens/LessonScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';
export default function LessonRoute() {
  const params = useLocalSearchParams<{
    levelId?: string;
    trackId?: string;
    labId?: string;
    labNumber?: string;
    lessonIndex?: string;
    isBoss?: string;
  }>();
  const router = useRouter();
  const levelId = Number(params.levelId) || 1;

  // Optional lab-scoped params (Starknet tracks). Forward through so
  // LessonScreen can resolve the lesson from the Starknet registry instead of
  // falling back to the flat numeric LEVELS table.
  const trackId     = typeof params.trackId     === 'string' ? params.trackId     : undefined;
  const labId       = typeof params.labId       === 'string' ? params.labId       : undefined;
  const labNumberStr = typeof params.labNumber  === 'string' ? params.labNumber   : undefined;
  const labNumber   = labNumberStr !== undefined && labNumberStr.length > 0
    ? (Number.isFinite(Number(labNumberStr)) ? Number(labNumberStr) : undefined)
    : undefined;
  const lessonIndexStr = typeof params.lessonIndex === 'string' ? params.lessonIndex : undefined;
  const lessonIndex = lessonIndexStr !== undefined && lessonIndexStr.length > 0
    ? (Number.isFinite(Number(lessonIndexStr)) ? Number(lessonIndexStr) : undefined)
    : undefined;
  const isBoss = params.isBoss === 'true' || params.isBoss === '1';

  // On lesson/boss completion, navigate back to the island map.
  // IslandMapScreen will then show the 3-track banner if boss 310 is done,
  // or the next island in sequence for any other completion.
  const handleDone = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/map' as any);
    }
  };

  return (
    <LessonScreen
      levelId={levelId}
      trackId={trackId}
      labId={labId}
      labNumber={labNumber}
      lessonIndex={lessonIndex}
      isBoss={isBoss}
      onExit={handleDone}
      onComplete={handleDone}
    />
  );
}
