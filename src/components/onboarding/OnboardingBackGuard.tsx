/**
 * OnboardingBackGuard intercepts hardware back and browser back during
 * account onboarding.
 *
 * Prevents the broken back-to-signup loop after account creation.
 * Covers Android BackHandler, iOS gesture, and browser popstate.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  BackHandler,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme, Spacing, Radius, FontSize, Brand } from "../../theme";
import { useAuth } from "../../hooks/useAuth";
import { SifterButton } from "../ui";

export function OnboardingBackGuard() {
  const navigation = useNavigation();
  const { signOut, deleteAccount, user } = useAuth();
  const { colors } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const pendingPop = useRef<(() => void) | null>(null);

  const canGuard =
    !!user &&
    user.auth_provider !== "guest";

  // Android hardware back.
  useEffect(() => {
    if (!canGuard) return;

    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      setShowModal(true);
      return true; // prevent default
    });

    return () => handler.remove();
  }, [canGuard]);

  // Browser Back/Forward must pause onboarding and ask what to do next.
  useEffect(() => {
    if (!canGuard || Platform.OS !== "web" || typeof window === "undefined") return;
    const currentUrl = window.location.href;
    let restoring = false;
    window.history.pushState({ ...(window.history.state ?? {}), onboardingGuard: true }, "", currentUrl);
    const onPopState = () => {
      if (restoring) {
        restoring = false;
        return;
      }
      restoring = true;
      window.history.go(1);
      setShowModal(true);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [canGuard]);

  // React Navigation pop intercept for native stacks and router actions.
  useEffect(() => {
    if (!canGuard) return;

    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      // Let the action through only if the user explicitly confirms
      if (e.data.action.type === "GO_BACK" || e.data.action.type === "POP") {
        e.preventDefault();
        pendingPop.current = () => navigation.dispatch(e.data.action);
        setShowModal(true);
      }
    });

    return () => unsubscribe();
  }, [canGuard, navigation]);

  const handleContinueLater = useCallback(async () => {
    setShowModal(false);
    try {
      await signOut({ preserveLocalUserState: true });
    } catch {
      // signOut is best-effort
    }
    // After signOut, user is null and the auth layout shows sign in/sign up.
  }, [signOut]);

  const handleDeleteAccount = useCallback(async () => {
    setShowModal(false);
    try {
      await deleteAccount();
    } catch {
      // deleteAccount clears the local session in its finally block.
    }
  }, [deleteAccount]);

  const handleContinue = useCallback(() => {
    setShowModal(false);
    pendingPop.current = null;
  }, []);

  if (!canGuard) return null;

  return (
    <Modal
      visible={showModal}
      transparent
      animationType="fade"
      onRequestClose={handleContinue}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.dialog,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            Leave onboarding?
          </Text>
          <Text style={[styles.body, { color: colors.textSoft }]}>
            Going back will leave onboarding. You can continue later with this
            account, or delete the account and start again.
          </Text>

          <View style={styles.actions}>
            <SifterButton
              label="Delete account"
              onPress={handleDeleteAccount}
              variant="ghost"
              size="md"
              fullWidth
            />
            <SifterButton
              label="Continue later"
              onPress={handleContinueLater}
              variant="ghost"
              size="md"
              fullWidth
            />
            <SifterButton
              label="Continue onboarding"
              onPress={handleContinue}
              variant="track"
              color={Brand.primary}
              size="md"
              fullWidth
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  dialog: {
    width: "100%",
    maxWidth: 380,
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "900",
    textAlign: "center",
  },
  body: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    textAlign: "center",
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
});
