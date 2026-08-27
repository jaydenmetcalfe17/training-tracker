// components/GenerateInviteButton.tsx

import "./GenerateInviteButton.scss";

import { useState } from "react";

interface GenerateInviteButtonProps {
  athleteId?: number;
  teamId?: number;
  role: "athlete" | "parent" | "coach";
}

const GenerateInviteButton: React.FC<GenerateInviteButtonProps> = ({
  athleteId,
  teamId,
  role
}) => {

  const [inviteLink, setInviteLink] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);


  const handleClick = async () => {

    setLoading(true);
    setError(null);

    const currentURL =
      window.location.origin;


    try {

      const res =
        await fetch(`/api/invite`, {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            athleteId,
            teamId,
            role,
            currentURL
          })
        });


      const data =
        await res.json();


      if (!res.ok) {

        throw new Error(
          data.error ||
          "Failed to generate invite link"
        );
      }


      setInviteLink(
        data.inviteLink
      );


    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Unknown error"
      );

    } finally {

      setLoading(false);
    }
  };


  return (
    <div>

      <button
        className="generate-invite-button"
        onClick={handleClick}
        disabled={loading}
      >
        {loading
          ? "Generating..."
          : "Generate Invite"}
      </button>


      {inviteLink && (
        <div>

          <p>
            Invite link:
          </p>

          <input
            type="text"
            value={inviteLink}
            readOnly
            style={{
              width: "100%"
            }}
          />

        </div>
      )}


      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

    </div>
  );
};


export default GenerateInviteButton;