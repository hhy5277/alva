import * as Types from '../types';
import { MessageType } from '../message';
import * as uuid from 'uuid';
import { FileInput } from '../container/file-input';
import * as React from 'react';
import * as Store from '../store';

const ids = {
	file: uuid.v4(),
	new: uuid.v4(),
	open: uuid.v4(),
	newPage: uuid.v4(),
	save: uuid.v4(),
	saveAs: uuid.v4(),
	exportHTML: uuid.v4(),
	close: uuid.v4()
};

export const fileMenu = (ctx: Types.MenuContext): Types.MenuItem => {
	const hasProject = typeof ctx.project !== 'undefined';
	const onDetailView = ctx.app && ctx.app.isActiveView(Types.AlvaView.PageDetail);
	const isLocal = ctx.app && !ctx.app.isHostType(Types.HostType.RemoteServer);
	const isElectron = ctx.app && ctx.app.isHostType(Types.HostType.LocalElectron);

	return {
		id: ids.file,
		label: '&File',
		submenu: [
			{
				id: ids.new,
				label: '&New',
				accelerator: 'CmdOrCtrl+N',
				click: sender => {
					sender.send({
						type: MessageType.CreateNewFileRequest,
						id: uuid.v4(),
						payload: undefined
					});
				}
			},
			{
				id: ids.open,
				label: '&Open',
				accelerator: 'CmdOrCtrl+O',
				click: sender => {
					sender.send({
						type: MessageType.OpenFileRequest,
						id: uuid.v4(),
						payload: undefined
					});
				},
				// TODO: Inject more deps
				render: (props: {
					accelerator: JSX.Element | null;
					sender: Types.Sender;
					style: React.CSSProperties;
					menu: Types.MenuItem;
					menuStore: Store.MenuStore;
					onMouseEnter: React.MouseEventHandler<HTMLElement>;
					onMouseLeave: React.MouseEventHandler<HTMLElement>;
				}) => {
					return (
						<label
							style={props.style}
							onClick={e => e.stopPropagation()}
							onMouseEnter={props.onMouseEnter}
							onMouseLeave={props.onMouseLeave}
						>
							Open
							{/* Can't trigger file inputs programmatically: props.accelerator */}
							<FileInput
								accept=".alva"
								onChange={contents => {
									props.menuStore.clear();

									props.sender.send({
										type: MessageType.UseFileRequest,
										id: uuid.v4(),
										payload: {
											silent: false,
											contents
										}
									});
								}}
							/>
						</label>
					);
				}
			},
			{
				id: uuid.v4(),
				type: 'separator'
			},
			{
				id: ids.newPage,
				label: 'New &Page',
				enabled: hasProject && onDetailView,
				accelerator: 'CmdOrCtrl+Shift+N',
				click: sender => {
					sender.send({
						type: MessageType.CreateNewPage,
						id: uuid.v4(),
						payload: undefined
					});
				}
			},
			{
				id: uuid.v4(),
				type: 'separator'
			},
			{
				id: ids.save,
				label: '&Save',
				enabled: hasProject && onDetailView,
				accelerator: 'CmdOrCtrl+S',
				visible: isLocal,
				role: 'save',
				click: sender => {
					if (!ctx.project) {
						return;
					}

					sender.send({
						type: MessageType.Save,
						id: uuid.v4(),
						payload: { publish: ctx.project.getDraft(), projectId: ctx.project.getId() }
					});
				}
			},
			{
				id: ids.saveAs,
				label: '&Save As',
				enabled: hasProject && onDetailView,
				accelerator: 'CmdOrCtrl+Shift+S',
				role: 'save',
				click: async sender => {
					if (!ctx.project) {
						return;
					}

					sender.send({
						type: MessageType.Save,
						id: uuid.v4(),
						payload: { publish: true, projectId: ctx.project.getId() }
					});
				}
			},
			{
				id: uuid.v4(),
				type: 'separator'
			},
			{
				id: ids.exportHTML,
				label: 'Export Prototype as HTML',
				enabled: onDetailView && hasProject,
				accelerator: 'CmdOrCtrl+E',
				click: async sender => {
					if (!ctx.project) {
						return;
					}

					sender.send({
						id: uuid.v4(),
						type: MessageType.ExportHtmlProject,
						payload: { path: undefined, projectId: ctx.project.getId() }
					});
				}
			},
			{
				id: uuid.v4(),
				type: 'separator',
				visible: isElectron
			},
			{
				id: ids.close,
				label: '&Close',
				accelerator: 'CmdOrCtrl+W',
				role: 'close',
				visible: isElectron,
				click: async () => {
					if (!ctx.project) {
						return;
					}

					// TODO: Send CloseProject message
				}
			}
		]
	};
};