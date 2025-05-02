import { StyleSheet, View, Text } from 'react-native';
import { theme } from '../constants/theme';

const MessageBox = ({ messages }) => {
  if (!Array.isArray(messages) || messages.length === 0) return null;

  return (
    <View style={{ marginTop: 20 }}>
      <Text style={[styles.text, { fontWeight: 'bold', marginBottom: 10 }]}>
        Mesaje de la Admin:
      </Text>
      {messages.map((msg) => (
        <View key={msg.id} style={styles.feedbackCard}>
          <Text style={styles.text}>{msg.message}</Text>
          <Text style={[styles.text, { fontSize: 12, color: '#999', marginTop: 5 }]}>
            {msg.timestamp instanceof Date
              ? msg.timestamp.toLocaleString()
              : msg.timestamp?.toDate?.()?.toLocaleString() || 'Fără dată'}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    color: theme.colors.text,
  },
  feedbackCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
});

export default MessageBox;