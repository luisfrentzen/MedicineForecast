import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { useState } from 'react';

export default function ListView({drugs, changeIndexGraph}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
    changeIndexGraph(index);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
      <List component="nav" aria-label="main mailbox folders">
        {
            drugs.map((drug, index)=>{
                return(
                    <ListItemButton key={index}
                        selected={selectedIndex === index}
                        onClick={(event) => handleListItemClick(event, index)}
                        >
                        <ListItemText primary={drug} />
                    </ListItemButton>
                )
            })
        }
      </List>
    </Box>
  );
}