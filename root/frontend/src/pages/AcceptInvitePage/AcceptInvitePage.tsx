//pages/AcceptInvitePage/AcceptInvitePage.tsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AcceptInvitePage.scss";

interface InviteDetails {
    role: "athlete" | "parent" | "coach";
    athleteId: number | null;
    teamId: number | null;
    used: boolean;
    expiresAt: string;
}

const AcceptInvitePage: React.FC = () => {

    const { inviteToken } =
        useParams<{ inviteToken: string }>();

    const navigate =
        useNavigate();

    const [invite, setInvite] =
        useState<InviteDetails | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);


    // ----------------------------------------
    // Get invite details
    // ----------------------------------------

    useEffect(() => {

        if (!inviteToken) {

            setError(
                "Invalid invite link."
            );

            setLoading(false);

            return;
        }


        const loadInvite =
            async () => {

                try {

                    const res =
                        await fetch(
                            `/api/invite/${inviteToken}`
                        );

                    const data =
                        await res.json();


                    if (!res.ok) {

                        throw new Error(
                            data.error ||
                            "Invalid invite link."
                        );
                    }


                    // ----------------------------------------
                    // Check whether invite is already used
                    // ----------------------------------------

                    if (data.used) {

                        setError(
                            "This invite link has already been used."
                        );

                        setLoading(false);

                        return;
                    }


                    // ----------------------------------------
                    // Check whether invite has expired
                    // ----------------------------------------

                    if (
                        data.expiresAt &&
                        new Date(data.expiresAt) < new Date()
                    ) {

                        setError(
                            "This invite link has expired. Please request a new one."
                        );

                        setLoading(false);

                        return;
                    }


                    // ----------------------------------------
                    // Store invite
                    // ----------------------------------------

                    setInvite({
                        role:
                            data.role,

                        athleteId:
                            data.athleteId ?? null,

                        teamId:
                            data.teamId ?? null,

                        used:
                            data.used,

                        expiresAt:
                            data.expiresAt
                    });

                    setError(null);

                } catch (err) {

                    console.error(
                        "Error loading invite:",
                        err
                    );

                    setError(
                        err instanceof Error
                            ? err.message
                            : "Invalid invite link."
                    );

                } finally {

                    setLoading(false);
                }
            };


        loadInvite();

    }, [inviteToken]);


    // ----------------------------------------
    // Loading
    // ----------------------------------------

    if (loading) {

        return (
            <div className="light-tan-box">

                <div className="white-box">

                    <h1>
                        Loading Invite...
                    </h1>

                    <p>
                        Please wait while we verify your invite link.
                    </p>

                </div>

            </div>
        );
    }


    // ----------------------------------------
    // Error
    // ----------------------------------------

    if (error || !invite) {

        return (
            <div className="light-tan-box">

                <div className="white-box">

                    <h1>
                        Invite Unavailable
                    </h1>

                    <p className="error-text">
                        {error ||
                            "This invite link is not available."}
                    </p>

                </div>

            </div>
        );
    }


    // ----------------------------------------
    // Role display
    // ----------------------------------------

    let roleTitle = "";
    let roleMessage = "";

    if (invite.role === "parent") {

        roleTitle =
            "Parent Invitation";

        roleMessage =
            "You have been invited to access an athlete's account as a parent.";

    } else if (invite.role === "athlete") {

        roleTitle =
            "Athlete Invitation";

        roleMessage =
            "You have been invited to create or access an athlete account.";

    } else if (invite.role === "coach") {

        roleTitle =
            "Coach Invitation";

        roleMessage =
            "You have been invited to join a team as a coach.";
    }


    // ----------------------------------------
    // Navigate to login
    // ----------------------------------------

    const handleLogin = () => {

        navigate(
            `/login?inviteToken=${inviteToken}`
        );
    };


    // ----------------------------------------
    // Navigate to registration
    // ----------------------------------------

    const handleCreateAccount = () => {

        navigate(
            `/register/${inviteToken}/create`
        );
    };


    // ----------------------------------------
    // Render
    // ----------------------------------------

    return (
        <div className="light-tan-box">

            <div className="white-box">

                <div className="accept-invite-page">

                    <h1>
                        {roleTitle}
                    </h1>


                    <p>
                        {roleMessage}
                    </p>


                    {invite.role === "parent" && (
                        <p>
                            Your account will be linked to the
                            athlete associated with this invitation.
                        </p>
                    )}


                    {invite.role === "athlete" && (
                        <div className="choose-text">
                            <p>
                                If you already have an athlete
                                account, log in to access it.
                            </p>
                            <p>
                                Otherwise, create a new account.
                            </p>
                        </div>
                    )}


                    {invite.role === "coach" && (
                        <p>
                            If you already have a coach account,
                            log in to join the team. Otherwise,
                            create a new account.
                        </p>
                    )}


                    <div className="accept-invite-buttons">

                        <button
                            className="main-button"
                            type="button"
                            onClick={handleLogin}
                        >
                            Log In
                        </button>


                        <button
                            className="main-button"
                            type="button"
                            onClick={handleCreateAccount}
                        >
                            Create Account
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
};


export default AcceptInvitePage;