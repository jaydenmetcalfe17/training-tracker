// components/GenerateInviteButton.tsx

import { useState } from "react";

interface GenerateInviteButtonProps {
  athleteId?: number;
  role: "athlete" | "parent" | "coach";
}

const GenerateInviteButton: React.FC<GenerateInviteButtonProps> = ({ athleteId, role }) => {

  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteId, role }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate invite link");
      }

      const data = await res.json();
      setInviteLink(data.inviteLink);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleClick} disabled={loading}>
        {loading ? "Generating..." : `Generate Invite`}
      </button>

      {inviteLink && (
        <div>
          <p>Invite link:</p>
          <input type="text" value={inviteLink} readOnly style={{ width: "100%" }} />
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default GenerateInviteButton;
