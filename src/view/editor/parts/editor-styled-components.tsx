/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { IconCheckbox } from '@zextras/carbonio-design-system';
import styled from 'styled-components';

export const ResizedIconCheckbox = styled(IconCheckbox)`
	[class^='Padding__Comp'] {
		padding: 6px;
		svg {
			height: 20px;
			width: 20px;
			fill: ${({ theme }): string => theme.palette.currentColor.regular};
		}
	}
`;
