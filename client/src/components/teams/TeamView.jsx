import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/client";
import MemberCard from "./MemberCard";

const teamLabels = {
  development: "Development Team",
  testing: "Testing Team",
  others: "Others",
};

export default function TeamView() {
  const { teamName } = useParams();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/teams/${teamName}`);
        setMembers(res.data);
      } catch (err) {
        console.error("Failed to fetch team:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [teamName]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {teamLabels[teamName] || teamName}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {members.length} member{members.length !== 1 ? "s" : ""} in this team
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : members.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          No members in this team yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
}
