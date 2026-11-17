import { scriptureFields } from "@/payload/fields";
import { Block } from "payload";

const BibleVerseBlock: Block = {
  slug: "bibleVerseBlock",
  labels: {
    singular: "Bible Verse",
    plural: "Bible Verses",
  },
  interfaceName: "BibleVerseBlock",
  fields: scriptureFields({ required: true }),
};

export default BibleVerseBlock;
