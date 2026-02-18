import { Stack } from 'expo-router';

export default function ExpensesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="add"
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
