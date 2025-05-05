import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserSquare } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils'; // Import cn function

// Extracted from the image provided
// NOTE: In a real app, this data would come from a database (e.g., Firestore)
// and would be filterable by season. This is for Season 3.
const players = [
  { id: '1', category: '5★', basePrice: '10pts', name: 'Shlok Desai', preferredPosition: ['Over the field'], preferredFoot: 'R', age: null, remarks: ['Captaincy', 'Physcial Strength'] },
  { id: '2', category: '5★', basePrice: '10pts', name: 'Aarya Kawle', preferredPosition: ['FW', 'MF'], preferredFoot: 'R', age: 21, remarks: ['Captaincy', 'Game Sense'] },
  { id: '3', category: '5★', basePrice: '10pts', name: 'Dhrishit', preferredPosition: ['MF', 'DEF'], preferredFoot: 'R', age: 20, remarks: ['Playmaking', 'Team player'] },
  { id: '4', category: '5★', basePrice: '10pts', name: 'Vikram', preferredPosition: ['MF', 'DEF'], preferredFoot: 'R', age: null, remarks: ['Playmaking', 'Team player'] },
  { id: '5', category: '5★', basePrice: '10pts', name: 'Aaron', preferredPosition: ['FW', 'MF'], preferredFoot: 'R', age: 23, remarks: ['Finishing', 'Skills'] },
  { id: '6', category: '4★', basePrice: '6pts', name: 'Arjun Desai', preferredPosition: ['Over the field'], preferredFoot: 'R', age: 17, remarks: ['All rounder'] },
  { id: '7', category: '4★', basePrice: '6pts', name: 'Hridant Sood', preferredPosition: ['Over the field'], preferredFoot: 'R', age: 17, remarks: ['Dribbling', 'Passing'] },
  { id: '8', category: '4★', basePrice: '6pts', name: 'Deep', preferredPosition: ['Over the field'], preferredFoot: 'R', age: 22, remarks: ['Positioning', 'Long passing'] },
  { id: '9', category: '4★', basePrice: '6pts', name: 'Nirvaan Sood', preferredPosition: ['Over the field'], preferredFoot: 'R', age: 22, remarks: ['Captaincy', 'Team player'] },
  { id: '10', category: '4★', basePrice: '6pts', name: 'Atharva Sawant', preferredPosition: ['FW', 'MF'], preferredFoot: 'R', age: 17, remarks: ['Game Sense', 'Dribbling'] },
  { id: '11', category: '3★', basePrice: '2pts', name: 'Tanish Gawade', preferredPosition: ['FW'], preferredFoot: 'R', age: 19, remarks: ['Finishing (in the box)'] },
  { id: '12', category: '3★', basePrice: '2pts', name: 'Sarthak Sharma', preferredPosition: ['MF', 'DEF'], preferredFoot: 'R', age: 15, remarks: ['Long passing'] },
  { id: '13', category: '3★', basePrice: '2pts', name: 'Amey Kawle', preferredPosition: ['FW'], preferredFoot: 'L', age: 15, remarks: ['Finishing (in the box)'] },
  { id: '14', category: '3★', basePrice: '2pts', name: 'Krish Mistry', preferredPosition: ['FW'], preferredFoot: 'R', age: 18, remarks: ['Dribbling', 'Finishing'] },
  { id: '15', category: '3★', basePrice: '2pts', name: 'Arnav Chaudhary', preferredPosition: ['DEF'], preferredFoot: 'R', age: 19, remarks: ['Passing', 'Wall'] },
  { id: '16', category: '3★', basePrice: '2pts', name: 'Shubham Parulkar', preferredPosition: ['FW'], preferredFoot: 'R', age: 18, remarks: ['Dribbling', 'Speed'] },
  { id: '17', category: '3★', basePrice: '2pts', name: 'Paras Patil', preferredPosition: ['MF', 'DEF'], preferredFoot: 'R', age: 18, remarks: ['Game Sense', 'Passing'] },
  { id: '18', category: '3★', basePrice: '2pts', name: 'Parth Jadwani', preferredPosition: ['FW', 'DEF'], preferredFoot: 'R', age: 15, remarks: ['Passing', 'In the box'] },
  { id: '19', category: '3★', basePrice: '2pts', name: 'Satej Dhaiphule', preferredPosition: ['DEF'], preferredFoot: 'L', age: null, remarks: ['Passing'] },
  { id: '20', category: '3★', basePrice: '2pts', name: 'Shreyas K', preferredPosition: ['DEF'], preferredFoot: 'R', age: null, remarks: ['Passing'] },
  { id: '21', category: '3★', basePrice: '2pts', name: 'Anish', preferredPosition: ['DEF'], preferredFoot: 'R', age: null, remarks: ['Wall'] },
  { id: '22', category: '3★', basePrice: '2pts', name: 'Harshvardhan', preferredPosition: ['DEF'], preferredFoot: 'R', age: 22, remarks: ['Physcial Strength', 'Long passing'] },
  { id: '23', category: '3★', basePrice: '2pts', name: 'Rauneet Singh', preferredPosition: ['FW'], preferredFoot: 'R', age: null, remarks: ['Dribbling'] },
  { id: '24', category: '3★', basePrice: '2pts', name: 'Ayaan Ansaari', preferredPosition: ['FW', 'MF'], preferredFoot: 'R', age: null, remarks: ['Dribbling', 'Positioning'] },
  { id: '25', category: '3★', basePrice: '2pts', name: 'Player 25', preferredPosition: ['DEF'], preferredFoot: 'R', age: null, remarks: [] }, // Assuming #25 has missing info based on image crop
];

const positionMapping: { [key: string]: string } = {
  'Over the field': 'All Positions',
  'FW': 'Forward',
  'MF': 'Midfield',
  'DEF': 'Defence',
};

const footMapping: { [key: string]: string } = {
  'R': 'Right',
  'L': 'Left',
};

// Define HSL based classes using Tailwind utilities
// Example: Define HSL colors in globals.css first
const categoryColors: { [key: string]: string } = {
    '5★': 'border-blue-300 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
    '4★': 'border-purple-300 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700',
    '3★': 'border-orange-300 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700',
}

function formatPosition(positions: string[]): string {
  return positions.map(p => positionMapping[p] || p).join(', ');
}

export default function PlayersPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <UserSquare className="w-8 h-8 text-primary" />
          Players (Season 3)
        </h1>
         {/* TODO: Add season selector dropdown here */}
      </div>
      <p className="text-muted-foreground">
        List of players participating in the current season. Base price indicates points for auction/selection.
      </p>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Sr. No.</TableHead>
                <TableHead>Player Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Preferred Position</TableHead>
                <TableHead>Foot</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="font-medium">{player.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                          <Image
                            // Using picsum based on player id for placeholder
                            src={`https://picsum.photos/seed/${player.id}/40/40`}
                            alt={`${player.name} avatar`}
                            width={40}
                            height={40}
                            className="rounded-full"
                            data-ai-hint="player portrait soccer"
                           />
                        <AvatarFallback>{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{player.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("font-bold", categoryColors[player.category] ?? '')}>
                      {player.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{player.basePrice}</TableCell>
                  <TableCell>{formatPosition(player.preferredPosition)}</TableCell>
                  <TableCell>{footMapping[player.preferredFoot] ?? player.preferredFoot}</TableCell>
                  <TableCell>{player.age ?? 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {player.remarks.map((remark, index) => (
                        <Badge key={index} variant="secondary">{remark}</Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
       <div className="mt-4 p-4 border rounded-lg bg-muted/50">
          <h3 className="font-semibold mb-2">Key Abbreviations:</h3>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li><span className="font-medium">Over the field:</span> All playing positions</li>
            <li><span className="font-medium">FW:</span> Forward/Attacking</li>
            <li><span className="font-medium">MF:</span> Midfield</li>
            <li><span className="font-medium">DEF:</span> Defence</li>
            <li><span className="font-medium">R:</span> Right Footed</li>
            <li><span className="font-medium">L:</span> Left Footed</li>
            <li><span className="font-medium">Wall:</span> Good defending skills</li>
            <li><span className="font-medium">In the box:</span> Always stays forward</li>
          </ul>
        </div>
    </div>
  );
}
