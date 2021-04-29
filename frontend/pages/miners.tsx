import React, { useMemo } from "https://esm.sh/react@17.0.2";
import styled from "https://esm.sh/styled-components";

import config from "../back/config/config.ts";

import { Container } from "../components/Container.ts";
import { Content } from "../components/Content.ts";
import SiteTitle from "../components/SiteTitle.tsx";
import { useStoreState } from "../state/index.ts";
import SiteMenu from "../components/SiteMenu.tsx";
import { Donation } from "../components/Donation.tsx";

const Table = styled.table`
  width: 100%;
  max-width: 1000px;
  box-shadow: #000 3px 3px 14px;
  border-radius: 6px;
  margin: 0 auto 30px;
  border: 0;
  border-collapse: collapse;
  border-radius: 8px;
  overflow: hidden;
`;

const TableHead = styled.thead`
  background-color: #383838;
`;

const TableBody = styled.tbody`
  text-align: center;
  background-color: #434343;

  tr:hover {
    background-color: #505050;
  }
`;

const TableRow = styled.tr`
  border-bottom: 2px solid #393939;

  &:last-child {
    border-bottom: 0;
  }
`;

const TableHeader = styled.th`
  color: #efefef;
  padding: 9px;
`;

const Cell = styled.td`
  color: #f0f0f0;
  > a {
    color: #f0f0f0;
  }
  padding: 17px;
`;

const SignallingCell = styled.td`
  padding: 16px;
  text-align: center;
`;

interface IMinerData {
  [key: string]: {
    name: string;
    signals: boolean;
    website: string | undefined;
    numBlocks: number;
  };
}

export default function Miners() {
  const blocks = useStoreState((store) => store.blocks);
  const forkName = config.fork.name;
  const currentNumberOfBlocks = blocks.reduce((prev, currentBlock) => prev + +(currentBlock.signals !== undefined), 0);

  const miners = useMemo(() => {
    // We have to reverse the array as we have to check
    // for the latest block by a miner to decide whether they
    // are signalling or not.
    const blocksReversed = blocks.slice(0);
    blocksReversed.reverse();

    return blocksReversed.reduce((prev, currBlock) => {
      if (!currBlock.miner) {
        return prev;
      }

      if (!prev[currBlock.miner]) {
        prev[currBlock.miner] = {
          name: currBlock.miner,
          signals: currBlock.signals ?? false,
          website: currBlock.minerWebsite,
          numBlocks: 1,
        };
        return prev;
      }
      prev[currBlock.miner].numBlocks++;
      return prev;
    }, {} as IMinerData);
  }, [blocks]);

  return (
    <Container>
      <head>
        <title>{forkName} activation - Miners</title>
      </head>
      <Content>
        <SiteTitle />
        <SiteMenu />
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Miner name</TableHeader>
              <TableHeader>Share</TableHeader>
              <TableHeader>Signals</TableHeader>
            </TableRow>
          </TableHead>

          <TableBody>
            {Object.entries(miners).map(([_, miner]) => {
              return (
                <TableRow>
                  <Cell>
                    {miner.website && (
                      <a href={miner.website} target="_blank">
                        {miner.name}
                      </a>
                    )}
                    {!miner.website && miner.name}
                  </Cell>
                  <Cell>{((miner.numBlocks / currentNumberOfBlocks) * 100).toFixed(1)}%</Cell>
                  <SignallingCell>
                    {miner.signals && <>✅</>}
                    {!miner.signals && <>🚫</>}
                  </SignallingCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {config.donation && <Donation />}
      </Content>
    </Container>
  );
}
