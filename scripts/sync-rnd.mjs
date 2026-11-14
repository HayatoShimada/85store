// R&D のページ（/rnd）に出すロードマップと、公開リポジトリの PR・Issue を GitHub から取って data/rnd.json に書く。
// Project は非公開なので、サイトからは読まずにここで書き出す（gh にログインしていること）。
//   npm run sync:rnd
// ロードマップの項目は、公開リポジトリのものと下書き（Draft）だけを載せる（非公開リポジトリの Issue・PR は載せない）
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const ORG = "85-Store-Research-Development";
const PROJECT = 1;

// 和文と英数字の間の半角スペースを消す（サイトは text-autospace で空きを付ける）
const JA = "[\\u3040-\\u30ff\\u3400-\\u9fff、。「」（）・ー]";
const tighten = (text) => text.replace(new RegExp(`(?<=${JA}) (?=[A-Za-z0-9(])`, "g"), "").replace(new RegExp(`(?<=[A-Za-z0-9)]) (?=${JA})`, "g"), "");

const gh = (args) => JSON.parse(execFileSync("gh", args, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }));

const query = `query($org: String!, $number: Int!, $after: String) {
  organization(login: $org) {
    projectV2(number: $number) {
      url
      items(first: 100, after: $after) {
        pageInfo { hasNextPage endCursor }
        nodes {
          type
          content {
            ... on DraftIssue { title }
            ... on Issue { title url repository { name isPrivate } }
            ... on PullRequest { title url repository { name isPrivate } }
          }
          fieldValues(first: 20) {
            nodes {
              ... on ProjectV2ItemFieldSingleSelectValue { name field { ... on ProjectV2FieldCommon { name } } }
              ... on ProjectV2ItemFieldDateValue { date field { ... on ProjectV2FieldCommon { name } } }
            }
          }
        }
      }
    }
  }
}`;

const items = [];
let projectUrl = "";
let after = null;
do {
  const args = ["api", "graphql", "-f", `query=${query}`, "-F", `org=${ORG}`, "-F", `number=${PROJECT}`];
  if (after) args.push("-f", `after=${after}`);
  const project = gh(args).data.organization.projectV2;
  projectUrl = project.url;
  items.push(...project.items.nodes);
  after = project.items.pageInfo.hasNextPage ? project.items.pageInfo.endCursor : null;
} while (after);

const STATUS = { Todo: "todo", "In Progress": "doing", Done: "done" };
const roadmap = items
  .filter((item) => item.content && !item.content.repository?.isPrivate)
  .map((item) => {
    const fields = Object.fromEntries(
      item.fieldValues.nodes.filter((v) => v?.field).map((v) => [v.field.name, v.name ?? v.date])
    );
    return {
      title: tighten(item.content.title.replace(/^#\d+\s*/, "")),
      url: item.content.url ?? null,
      pillar: fields["柱"] ?? null,
      phase: fields["時期"] ?? null,
      status: STATUS[fields.Status] ?? "todo",
      repo: fields["リポジトリ"] ?? null,
      start: fields["開始日"] ?? null,
      end: fields["終了日"] ?? fields["開始日"] ?? null,
    };
  })
  .filter((item) => item.pillar && item.start);

// 公開リポジトリの PR・Issue（更新が新しい順）
const search = (kind) =>
  gh(["api", "-X", "GET", "search/issues", "-f", `q=org:${ORG} is:public is:${kind}`, "-f", "sort=updated", "-f", "per_page=8"]).items.map(
    (item) => ({
      title: tighten(item.title),
      url: item.html_url,
      number: item.number,
      repo: item.repository_url.split("/").pop(),
      state: item.pull_request?.merged_at ? "merged" : item.state,
      updatedAt: item.updated_at,
    })
  );

const data = { generatedAt: new Date().toISOString(), projectUrl, roadmap, pulls: search("pr"), issues: search("issue") };
writeFileSync(new URL("../data/rnd.json", import.meta.url), JSON.stringify(data, null, 2) + "\n");
console.log(`ロードマップ ${roadmap.length} 件（非公開を除く ${items.length - roadmap.length} 件）、PR ${data.pulls.length} 件、Issue ${data.issues.length} 件を data/rnd.json に書きました`);
