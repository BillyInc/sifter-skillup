/**
 * Subtle footer disclaimer — sits at the bottom of every main screen.
 * Tapping "Learn more" opens the LearnMoreScreen.
 * Plain. Honest. Never blocking.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Colors, Spacing, FontSize } from '../theme';
import LearnMoreScreen from '../screens/LearnMoreScreen';

interface Props {
  trackId?: string;
}

export default function DisclaimerFooter({ trackId }: Props) {
  const [showLearnMore, setShowLearnMore] = useState(false);

  return (
    <>
      <View style={styles.footer}>
        <Text style={styles.text}>
          Sifter Skill_Up is a learning tool, not a job guarantee.{' '}
        </Text>
        <TouchableOpacity onPress={() => setShowLearnMore(true)}>
          <Text style={styles.link}>Learn more</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showLearnMore}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLearnMore(false)}
      >
        <LearnMoreScreen
          trackId={trackId}
          onClose={() => setShowLearnMore(false)}
        />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg,
    borderTopWidth: 1, borderTopColor: Colors.border,
    backgroundColor: Colors.bg, flexWrap: 'wrap',
  },
  text: { fontSize: 10, color: Colors.textMuted },
  link: { fontSize: 10, color: Colors.accent, fontWeight: '700', textDecorationLine: 'underline' },
});
