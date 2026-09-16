import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

/** Hide all built-in Amazon Bedrock models from pi's model catalog. */
export default function (pi: ExtensionAPI) {
  pi.registerProvider("amazon-bedrock", { models: [] });
}
