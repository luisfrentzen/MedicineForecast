import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export default function NewsCard({ source, info, getSourceDocument }) {
  return (
    <Card className="text-[#4a4a4a] text-sm leading-5 flex flex-col justify-between w-[40rem] h-full border-[1px]">
      <CardContent>
        <div className="whitespace-pre-line text-justify mb-8">
          <div className="font-semibold">News body:</div>
          {info}
        </div>
        <a className="" href={source}>
          <div className="font-semibold">Sourced from: </div>
          <u>{source}</u>
        </a>
      </CardContent>
    </Card>
  );
}
