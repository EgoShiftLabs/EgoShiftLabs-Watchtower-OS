# Watchtower OS — Privacy and public demonstration boundary

This GitHub repository and its Pages deployment are PUBLIC. The app is a general-purpose product; there are no real personal profiles, legacy user notes, private project data or financial records in the repository or synthetic defaults.

The current client-side application stores user-entered notes and preferences only in the device browser's localStorage. This is not encrypted, authenticated, synchronized or resilient to browser clearing or device loss. A JSON export contains stored entries in plain text.

Do not enter API keys, bank credentials, account IDs, medical details, customer financial information, nonpublic research, confidential relationships or sensitive family material into the prototype.

The app does not intentionally send stored user records to any server, run telemetry, call third-party AI providers or trade automatically. Any user-opened external source link goes to the relevant third-party website.

## Future requirements
- Private authenticated per-user storage with row-level access tests.
- Rights to review, export, correct and delete records.
- Explicit permission for alerts, shared workspaces or cross-product data exchange.
- Encryption and secure access, secret management, retention and tested backups.
- No use of user-supplied personal information for marketing, data sales or unrelated products without a lawful basis and informed consent.
- Independent privacy/security review prior to commercial deployment.
