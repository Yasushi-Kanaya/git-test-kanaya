const asana = require('asana');
const asana_url_prefix = 'https://app.asana.com/0/'

const pat = process.env.ASANA_PAT;
const custom_header = { "Asana-Enable": "new_user_task_lists" };
const client = asana.Client.create({"defaultHeaders": custom_header }).useAccessToken(pat);
const project_filter = "スプリント";
const section_filter = "DONE";
const tag_release = "リリース";
const tag_release_gid = "1199678875237750";

let workspace_gid;
let project_gid;
let section_list = [];
let released_flag = 0;

function printMarkdown(task_name,task_gid) {
    // MarkDown形式にて、タスク名でAsanaのURL一覧を生成
    // - [タスク名](https://app.asana.com/0/project_gid/task_gid)
    const url = asana_url_prefix + project_gid + '/' + task_gid;
    const markdown = '- [' + task_name + '](' + url + ')%';

    // CIで値を渡すため、改行しないで出力し、後に「%」を改行で置換する
    // console.log(markdown);
    process.stdout.write(markdown);
}

function addReleaseTag(task_gid) {
    client.tasks.addTagForTask(task_gid, {tag: tag_release_gid, pretty: true})
        .then((result) => {
            // console.log(result);
        });
}

// workspaceのgidを取得
client.workspaces.getWorkspaces({opt_pretty: true})
    .then((result_workspace) => {
        // console.log(result_workspace);
        // console.log('workspace_gid:',result_workspace.data[0].gid);
        workspace_gid = result_workspace.data[0].gid;

        // 「スプリント」で始まるプロジェクトの最新のgidを取得
        client.projects.getProjects({workspace: workspace_gid ,opt_pretty: true})
            .then((result_project) => {
                // console.log(result_project.data);
                const project_list = [];
                result_project.data.forEach(currentValue => {
                    // console.log(currentValue);
                    if (currentValue.name.startsWith(project_filter)) {
                        // console.log(currentValue)
                        project_list.push(currentValue);
                    }
                });

                //project_gid = project_list[0].gid; ↓一時的に固定
                project_gid = '1199606600307210';
                // console.log('project_gid:',project_gid);

                // 「DONE」で終わるセクションのgidを取得
                client.sections.getSectionsForProject(project_gid, {opt_pretty: true})
                    .then((result_section) => {
                        // console.log(result_section);
                        result_section.data.forEach(currentValue => {
                            if (currentValue.name.endsWith(section_filter)) {
                                // console.log(currentValue.name,':',currentValue.gid);
                                section_list.push(currentValue.gid);
                            }
                        });

                        // セクションごとにループ
                        section_list.forEach(currentValue => {
                            // console.log('section_gid:', currentValue);
                            const section_gid = currentValue;

                            // セクション内のタスク一覧を取得
                            client.tasks.getTasksForSection(section_gid, {opt_pretty: true})
                                .then((result_tasks) => {
                                    // console.log(result_tasks.data);

                                    result_tasks.data.forEach(currentValue => {
                                        const task_gid = currentValue.gid;

                                        // タスク詳細を取得
                                        client.tasks.getTask(task_gid, {opt_pretty: true})
                                            .then((result_task) => {
                                                // console.log('task_gid:',result_task.gid,'tags:',result_task.tags);

                                                // 以下のタスクを対象とする
                                                //   タグが付いていないタスク(tagsに値が存在しないタスク)
                                                //   「リリース」タグが付いていないタスク

                                                // タグが付いていないタスク(tagsに値が存在しないタスク)
                                                if (!result_task.tags.length) {
                                                    // process.stdout.write('tagsなし-> ');
                                                    //printMarkdown(result_task.name,task_gid);
                                                } else {
                                                    // タグが付いているタスクを抽出(tagsに値があるタスク)
                                                    result_task.tags.forEach(currentValue => {
                                                        // process.stdout.write('tagsあり-> ');
                                                        // console.log('task_gid:',result_task.gid, 'tags:', currentValue);

                                                        // 「リリース」タグが付いているものをカウント
                                                        if (currentValue.name === tag_release) {
                                                            released_flag++;
                                                        }
                                                    });

                                                    // 「リリース」タグが付いていないタスク
                                                    if (released_flag === 0) {
                                                        //process.stdout.write('リリースtagsなし-> ');
                                                        printMarkdown(result_task.name,task_gid);

                                                        //「リリース」タグを付ける
                                                        //addReleaseTag(task_gid);
                                                    } else {
                                                        released_flag = 0;
                                                    }

                                                }

                                            });

                                    });

                                });
                        });

                    });
            });
    });
