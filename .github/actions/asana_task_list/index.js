const asana = require('asana');
const asana_url_prefix = 'https://app.asana.com/0/'

const pat = process.env.ASANA_PAT;
const client = asana.Client.create().useAccessToken(pat);

const project_filter = "スプリント";
const section_filter = "DONE";
let workspace_gid;
let project_gid;
let section_list = [];


// workspaceのgidを取得
client.workspaces.getWorkspaces({opt_pretty: true})
    .then((result_workspace) => {
        // console.log(result_workspace);
        console.log('workspace_gid:',result_workspace.data[0].gid);
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
                console.log('project_gid:',project_gid);

                // 「DONE」で終わるセクションのgidを取得
                client.sections.getSectionsForProject(project_gid, {opt_pretty: true})
                    .then((result_section) => {
                        // console.log(result_section);
                        result_section.data.forEach(currentValue => {
                            if (currentValue.name.endsWith(section_filter)) {
                                console.log(currentValue.name,':',currentValue.gid);
                                section_list.push(currentValue.gid);
                            }
                        });

                        // セクション内のタスクを取得
                        section_list.forEach(currentValue => {
                            // console.log('section_gid:', currentValue);
                            const section_gid = currentValue;
                            client.tasks.getTasksForSection(section_gid, {opt_pretty: true})
                                .then((result_tasks) => {
                                    // console.log(result_tasks.data);

                                    // MarkDown形式にて、タスク名でAsanaのURL一覧を生成
                                    // - [タスク名](https://app.asana.com/0/project_gid/task_gid)
                                    result_tasks.data.forEach(currentValue => {
                                        const task_gid = currentValue.gid;
                                        const task_name = currentValue.name;
                                        const url = asana_url_prefix + project_gid + '/' + task_gid
                                        const markdown = '- [' + task_name + '](' + url + ')'
                                        console.log(markdown);

                                    });

                                });
                        });

                    });
            });
    });
