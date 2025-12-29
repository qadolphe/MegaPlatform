
import { LayoutBlockSchema } from "../src/lib/schemas/component-props";

const validBlock = {
    id: "123",
    type: "Hero",
    props: {
        title: "Welcome",
        animationStyle: "simple"
    }
};

const invalidBlock = {
    id: "456",
    type: "Hero",
    props: {
        animationStyle: "INVALID_STYLE" // Should fail
    }
};

const missingTypeBlock = {
    id: "789",
    // Missing type
    props: {}
};

console.log("Testing Valid Block...");
const res1 = LayoutBlockSchema.safeParse(validBlock);
if (res1.success) console.log("✅ Passed");
else console.error("❌ Failed:", res1.error);

console.log("\nTesting Invalid Block (Bad Enum)...");
const res2 = LayoutBlockSchema.safeParse(invalidBlock);
if (!res2.success) console.log("✅ Caught Error Correctly");
else console.error("❌ Failed to catch error");

console.log("\nTesting Invalid Block (Missing Type)...");
const res3 = LayoutBlockSchema.safeParse(missingTypeBlock);
if (!res3.success) console.log("✅ Caught Error Correctly");
else console.error("❌ Failed to catch error");
