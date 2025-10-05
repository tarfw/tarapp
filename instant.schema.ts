// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react-native";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      type: i.string().optional(),
    }),
    tasks: i.entity({
      note: i.string().optional(),
      status: i.string().optional(),
      title: i.string(),
    }),
  },
  links: {
    $usersLinkedPrimaryUser: {
      forward: {
        on: "$users",
        has: "one",
        label: "linkedPrimaryUser",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "linkedGuestUsers",
      },
    },
    tasks$creator: {
      forward: {
        on: "tasks",
        has: "many",
        label: "$creator",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "creator",
      },
    },
    tasks$doer: {
      forward: {
        on: "tasks",
        has: "many",
        label: "$doer",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "doer",
      },
    },
  },
  rooms: {},
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
