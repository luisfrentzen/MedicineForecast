import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export default function NewsCard({ title, info, getSourceDocument }) {
  return (
    <Card className="flex flex-col justify-between w-[20rem] h-full border-[1px]">
      <CardContent>
        <div className="text-2xl mb-2">{title.slice(3)}</div>
        <div className="text-sm text-[#4a4a4a] whitespace-pre-line leading-5">
          {info}
        </div>
      </CardContent>
      <CardActions>
        {title != null && (
          <Button
            onClick={() => getSourceDocument(title.slice(3))}
            size="small"
          >
            Learn More
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
