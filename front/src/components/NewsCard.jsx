import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

const bull = (
  <Box
    component="span"
    sx={{ display: "inline-block", mx: "2px", transform: "scale(0.8)" }}
  >
    •
  </Box>
);

export default function NewsCard({ title, info, getSourceDocument }) {
  return (
    <Card
      className="flex flex-col justify-between max-w-lg"
      sx={{ minWidth: 275, minHeight: 350 }}
    >
      <CardContent>
        <Typography variant="h5" component="div">
          {title}
        </Typography>
        <Typography className="whitespace-pre-line" variant="body2">
          {info}
        </Typography>
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
