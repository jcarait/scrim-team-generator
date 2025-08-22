import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useState} from "react";

export function Generator() {
  const players = ['Jono', 'Gel', 'Matt', 'Raimie', 'Qwayne', 'El', 'John', 'Mark', 'Matthew', 'Luke', 'Thad', 'Chad', 'Esther', 'Jude', 'Paul' ]

  const [totalSessionMinutes, setTotalSessionMinutes] = useState(0);
  const [segmentSessionMinutes, setSegmentSessionMinutes] = useState(0);

  return (
    <div className="flex flex-col gap-6 p-20">
      <h1 className="text-2xl">Scrim Team Generator</h1>
      <div className="flex gap-8 max-w-2/3">
        <Input type="number" value={segmentSessionMinutes}  onChange={(e => setSegmentSessionMinutes(Number(e.target.value)))} placeholder="How many minutes per session?" />
        <Input type="number" value={totalSessionMinutes} onChange={e => setTotalSessionMinutes(Number(e.target.value))} placeholder="Total session minutes" />
      </div>
      <div className="flex">
        <Button>Generate session</Button>
      </div>
      <section>
        <p className="text-xl">{players.length} players</p>
        <ol className="list-decimal">
          {players.map((player, index) => (
            <li key={index}>{player}</li>
          ))}
        </ol>
      </section>
    </div>
  )
}
