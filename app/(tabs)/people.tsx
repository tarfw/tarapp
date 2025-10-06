import { Text, View } from "react-native";
import db from '../../lib/db';

export default function PeopleScreen() {
  const user = db.useUser();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      <Text>People Tab</Text>
      <Text style={{ marginTop: 10 }}>Signed in as: {user?.email}</Text>
    </View>
  );
}