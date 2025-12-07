import "./Ranks.css";
function Ranks({ ranks,theme }) {
  return (
    <div className={theme === "dark" ? "ranks-dark": "ranks"} key={ranks}>
      {ranks.map((rank) => (
        <span key={rank}>{rank}</span>
      ))}
    </div>
  );
}

export default Ranks;
