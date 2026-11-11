
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  runTransaction,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";

import {
  Search,
  Users,
  UserPlus,
  Check,
  X,
  Clock,
  Utensils,
  MessageCircle
} from "lucide-react";

function FriendManagement() {
  const { user, profile } = useAuth();

  const [searchUsername, setSearchUsername] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");

  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);

  const [activeTab, setActiveTab] = useState("friends");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Load friend requests and accepted friendships
  const loadData = async () => {
    if (!user) return;

    try {
      const requestQuery = query(
        collection(db, "friendRequests"),
        where("toUid", "==", user.uid),
        where("status", "==", "pending")
      );

      const friendQuery = query(
        collection(db, "friendships"),
        where("members", "array-contains", user.uid)
      );

      const [requestSnapshot, friendSnapshot] =
        await Promise.all([
          getDocs(requestQuery),
          getDocs(friendQuery)
        ]);

      setRequests(
        requestSnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data()
        }))
      );

      setFriends(
        friendSnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data()
        }))
      );
    } catch (error) {
      console.error("Friend loading error:", error);
      setMessage("Unable to load friends. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Search users using their unique username
  const handleSearch = async (e) => {
    e.preventDefault();

    setMessage("");
    setSearchResult(null);

    const username = searchUsername.trim().toLowerCase();

    if (!username) {
      setMessage("Please enter a username.");
      return;
    }

    if (!user) {
      setMessage("Please log in first.");
      return;
    }

    if (username === profile?.username?.toLowerCase()) {
      setMessage("You cannot add yourself.");
      return;
    }

    setSearching(true);

    try {
      console.log("Searching username:", username);

      // Only read the username document
      const usernameRef = doc(db, "usernames", username);
      const usernameSnapshot = await getDoc(usernameRef);

      if (!usernameSnapshot.exists()) {
        setMessage("No user found with this username.");
        return;
      }

      const foundUser = usernameSnapshot.data();

      if (!foundUser.uid || foundUser.uid === user.uid) {
        setMessage("Invalid user.");
        return;
      }

      // Check already-loaded friends
      const alreadyFriend = friends.some(
        (friend) => friend.members?.includes(foundUser.uid)
      );

      if (alreadyFriend) {
        setMessage("You are already friends!");
        return;
      }

      setSearchResult({
        uid: foundUser.uid,
        username: foundUser.username || username,
        fullName: foundUser.fullName || foundUser.username || username
      });

      setMessage("User found successfully!");
    } catch (error) {
      console.error("Search error:", error);
      console.error("Error code:", error.code);

      setMessage(
        error.code === "permission-denied"
          ? "Firestore denied username access. Please check Firebase rules."
          : "Unable to search. Please try again."
      );
    } finally {
      setSearching(false);
    }
  };

  // Send friend request
  const sendRequest = async () => {
    if (!searchResult || !user || processing) return;

    if (!profile?.username || !profile?.fullName) {
      setMessage("Your profile information is incomplete.");
      return;
    }

    setProcessing(true);
    setMessage("");

    try {
      await addDoc(collection(db, "friendRequests"), {
        fromUid: user.uid,
        toUid: searchResult.uid,
        fromUsername: profile.username,
        toUsername: searchResult.username,
        fromName: profile.fullName,
        toName: searchResult.fullName,
        status: "pending",
        createdAt: serverTimestamp()
      });

      setMessage("Friend request sent successfully!");
      setSearchResult(null);
      setSearchUsername("");
    } catch (error) {
      console.error("Send request error:", error);
      setMessage("Could not send friend request. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // Accept or reject a friend request
  const handleRequest = async (request, action) => {
    if (!user || processing) return;

    setProcessing(true);
    setMessage("");

    try {
      if (action === "accept") {
        const friendshipId = [
          request.fromUid,
          request.toUid
        ].sort().join("_");

        await runTransaction(db, async (transaction) => {
          const requestRef = doc(db, "friendRequests", request.id);
          const friendshipRef = doc(db, "friendships", friendshipId);

          const requestSnapshot = await transaction.get(requestRef);

          if (!requestSnapshot.exists()) {
            throw new Error("Friend request no longer exists.");
          }

          const currentRequest = requestSnapshot.data();

          if (
            currentRequest.toUid !== user.uid ||
            currentRequest.status !== "pending"
          ) {
            throw new Error("This request is no longer available.");
          }

          const friendshipSnapshot = await transaction.get(friendshipRef);

          if (friendshipSnapshot.exists()) {
            throw new Error("You are already friends.");
          }

          const members = [
            currentRequest.fromUid,
            currentRequest.toUid
          ].sort();

          transaction.update(requestRef, {
            status: "accepted",
            updatedAt: serverTimestamp()
          });

          transaction.set(friendshipRef, {
            members,
            memberProfiles: {
              [currentRequest.fromUid]: {
                username: currentRequest.fromUsername,
                fullName: currentRequest.fromName
              },
              [currentRequest.toUid]: {
                username: currentRequest.toUsername,
                fullName: currentRequest.toName
              }
            },
            requestId: request.id,
            createdAt: serverTimestamp()
          });
        });

        setMessage("Friend request accepted!");
      } else {
        await updateDoc(doc(db, "friendRequests", request.id), {
          status: "rejected",
          updatedAt: serverTimestamp()
        });

        setMessage("Friend request declined.");
      }

      await loadData();

    } catch (error) {
      console.error("Friend request error:", error);
      setMessage(error.message || "Something went wrong.");
    } finally {
      setProcessing(false);
    }
  };

  // Get the other friend's details
  const getOtherMember = (friendship) => {
    const otherUid = friendship.members?.find(
      (member) => member !== user?.uid
    );

    return friendship.memberProfiles?.[otherUid] || {
      fullName: "Foodie Friend",
      username: "foodie"
    };
  };

  return (
    <div className="friends-page">

      <div className="friends-heading">
        <span className="section-label">
          YOUR FOOD COMMUNITY
        </span>

        <h1>Find your food people! 🍕</h1>

        <p>
          Good food tastes even better when shared with friends.
        </p>
      </div>

      {/* Find Friends */}

      <div className="friend-search-card">

        <h2>
          <Search size={22} />
          Find Friends
        </h2>

        <p>
          Search for people using their unique username.
        </p>

        <form
          onSubmit={handleSearch}
          className="friend-search-form"
        >
          <input
            type="text"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            placeholder="Enter username, e.g. ananya_foodie"
          />

          <button type="submit" disabled={searching}>
            {searching ? "Searching..." : "Search"}
          </button>
        </form>

        {message && (
          <p className="friend-message" role="status">
            {message}
          </p>
        )}

        {searchResult && (
          <div className="search-user-result">

            <div className="friend-avatar">
              {searchResult.fullName.charAt(0).toUpperCase()}
            </div>

            <div className="friend-details">
              <strong>{searchResult.fullName}</strong>
              <span>@{searchResult.username}</span>
            </div>

            <button
              onClick={sendRequest}
              disabled={processing}
              className="add-friend-btn"
            >
              <UserPlus size={17} />
              {processing ? "Sending..." : "Add Friend"}
            </button>

          </div>
        )}

      </div>

      {/* Tabs */}

      <div className="friend-tabs">

        <button
          className={activeTab === "friends" ? "active" : ""}
          onClick={() => setActiveTab("friends")}
        >
          <Users size={17} />
          My Friends ({friends.length})
        </button>

        <button
          className={activeTab === "requests" ? "active" : ""}
          onClick={() => setActiveTab("requests")}
        >
          <UserPlus size={17} />
          Requests ({requests.length})
        </button>

      </div>

      {/* Friend lists */}

      {loading ? (

        <div className="friends-empty">
          Loading your food community...
        </div>

      ) : activeTab === "friends" ? (

        <div className="friends-grid">

          {friends.length === 0 ? (

            <div className="friends-empty">
              <Utensils size={36} />
              <h3>Your food community starts here!</h3>
              <p>
                Search for a username and add your first friend.
              </p>
            </div>

          ) : (

            friends.map((friend) => {
              const other = getOtherMember(friend);

              return (
                <div className="friend-card" key={friend.id}>

                  <div className="friend-avatar">
                    {other.fullName.charAt(0).toUpperCase()}
                  </div>

                  <div className="friend-details">
                    <strong>{other.fullName}</strong>
                    <span>@{other.username}</span>
                  </div>

                  <span className="friend-status">
                    <Check size={15} /> Friends
                  </span>

                </div>
              );
            })

          )}

        </div>

      ) : (

        <div className="requests-list">

          {requests.length === 0 ? (

            <div className="friends-empty">
              <Clock size={36} />
              <h3>No pending requests</h3>
              <p>
                When someone sends you a request, it appears here.
              </p>
            </div>

          ) : (

            requests.map((request) => (

              <div className="friend-card" key={request.id}>

                <div className="friend-avatar">
                  {(request.fromName || "F").charAt(0).toUpperCase()}
                </div>

                <div className="friend-details">
                  <strong>{request.fromName}</strong>
                  <span>@{request.fromUsername}</span>
                </div>

                <button
                  className="accept-btn"
                  disabled={processing}
                  onClick={() => handleRequest(request, "accept")}
                  aria-label="Accept friend request"
                >
                  <Check size={18} />
                </button>

                <button
                  className="reject-btn"
                  disabled={processing}
                  onClick={() => handleRequest(request, "reject")}
                  aria-label="Reject friend request"
                >
                  <X size={18} />
                </button>

              </div>

            ))

          )}

        </div>

      )}

    </div>
  );
}

export default FriendManagement;
